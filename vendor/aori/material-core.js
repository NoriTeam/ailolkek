export const defaultTokens = { roughness: .45, transmission: .65, light: 1.2, edge: .55, radius: 40, merge: 28, color: "#906CFF" };
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function body(id, x, y, width, height, color = "#906CFF", radius = 32) {
    return { id, x, y, width, height, color, radius, target: { x, y }, velocity: { x: 0, y: 0 }, opacity: 1 };
}
export function world(bodies) {
    return { bodies, waves: [], pointer: { x: 200, y: 130 }, hover: 0, hoverTarget: 0, state: "idle", stateBlend: { error: 0, success: 0 }, reactionAge: 10, elapsed: 0, dragging: null,
        mergeMode: "backing", alignedBlend: 0, joinRate: 11.6, lights: [], contacts: [], backings: [],
        loading: { progress: .36, rate: 24, targetRate: 24, phase: 0, running: false, completed: false },
        message: { age: 0, active: false, delivered: false, origin: { x: 328, y: 220 }, bodyId: "message-b", sourceId: null, destination: { x: 269, y: 135 }, width: 202, height: 64 },
    };
}
export const smooth = (v) => { const t = clamp(v, 0, 1); return t * t * (3 - 2 * t); };
export function setMaterialState(w, next, replay = false) {
    if (w.state !== next || replay)
        w.reactionAge = 0;
    w.state = next;
}
export function reactionEnvelope(age) {
    if (age >= 1.5)
        return 0;
    return smooth(age / .12) * Math.exp(-age * 2.5) * (1 - smooth((age - 1.05) / .45));
}
export function materialGroups(bodies, merge) {
    const groups = [];
    const parent = bodies.map((_, i) => i);
    const root = (i) => parent[i] === i ? i : (parent[i] = root(parent[i]));
    for (let i = 0; i < bodies.length; i++)
        for (let j = i + 1; j < bodies.length; j++) {
            const gap = surfaceGap(bodies[i], bodies[j]);
            if (gap < merge * .5 || gap <= 0)
                parent[root(j)] = root(i);
        }
    const map = new Map();
    bodies.forEach((b, i) => { const r = root(i); if (!map.has(r))
        map.set(r, []); map.get(r).push(b); });
    for (const group of map.values())
        groups.push(group);
    return groups;
}
export function surfaceGap(a, b) {
    const r = Math.min(a.radius, a.width / 2, a.height / 2) + Math.min(b.radius, b.width / 2, b.height / 2);
    const qx = Math.abs(a.x - b.x) - (a.width + b.width) / 2 + r, qy = Math.abs(a.y - b.y) - (a.height + b.height) / 2 + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
export function bounds(bodies) {
    const left = Math.min(...bodies.map(b => b.x - b.width / 2)), right = Math.max(...bodies.map(b => b.x + b.width / 2));
    const top = Math.min(...bodies.map(b => b.y - b.height / 2)), bottom = Math.max(...bodies.map(b => b.y + b.height / 2));
    return { x: (left + right) / 2, y: (top + bottom) / 2, width: right - left, height: bottom - top };
}
export function connectorEndpoints(a, b) {
    const boundary = (from, to) => { const length = Math.hypot(to.x - from.x, to.y - from.y) || 1, dx = (to.x - from.x) / length, dy = (to.y - from.y) / length; let lo = 0, hi = Math.hypot(from.width, from.height); for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (roundedDistance({ x: from.x + dx * mid, y: from.y + dy * mid }, from) > 0)
            hi = mid;
        else
            lo = mid;
    } return { x: from.x + dx * lo, y: from.y + dy * lo }; };
    return { from: boundary(a, b), to: boundary(b, a) };
}
export function roundedDistance(p, b) {
    const r = Math.min(b.radius, b.width / 2, b.height / 2);
    const qx = Math.abs(p.x - b.x) - b.width / 2 + r;
    const qy = Math.abs(p.y - b.y) - b.height / 2 + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
/** Rounded-edge capture, including diagonal/vertical approaches; never fills a bounding box. */
export function magneticTarget(a, b, capture = 22) {
    const dx = a.target.x - b.target.x, dy = a.target.y - b.target.y, length = Math.hypot(dx, dy);
    if (length < .001)
        return null;
    const contact = body("contact", b.target.x, b.target.y, a.width + b.width, a.height + b.height, b.color, Math.min(a.radius, a.width / 2, a.height / 2) + Math.min(b.radius, b.width / 2, b.height / 2));
    const gap = roundedDistance(a.target, contact);
    if (gap > capture || gap <= -8)
        return null;
    let lo = 0, hi = length;
    for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2, p = { x: b.target.x + dx / length * mid, y: b.target.y + dy / length * mid };
        if (roundedDistance(p, contact) > -8)
            hi = mid;
        else
            lo = mid;
    }
    return { x: b.target.x + dx / length * lo, y: b.target.y + dy / length * lo };
}
export function smoothUnion(a, b, radius) {
    if (radius <= 0)
        return Math.min(a, b);
    const h = Math.max(radius - Math.abs(a - b), 0) / radius;
    return Math.min(a, b) - h * h * radius * .25;
}
export function field(p, bodies, merge) {
    return bodies.reduce((d, b) => smoothUnion(d, roundedDistance(p, b), merge), 1e6);
}
function updateContacts(w, visible, dt, reduced) {
    let moving = false;
    const previousContacts = new Map(w.contacts.map(c => [c.key, c]));
    const nextContacts = [];
    if (w.mergeMode !== "none")
        for (let i = 0; i < visible.length; i++)
            for (let j = i + 1; j < visible.length; j++) {
                const a = visible[i], b = visible[j], gap = surfaceGap(a, b);
                const contains = (outer, inner) => Math.abs(outer.x - inner.x) + inner.width / 2 <= outer.width / 2 && Math.abs(outer.y - inner.y) + inner.height / 2 <= outer.height / 2;
                if (gap > 30 || contains(a, b) || contains(b, a))
                    continue;
                const key = [a.id, b.id].sort().join("|"), old = previousContacts.get(key), joined = gap <= 0;
                const age = joined ? (old?.joined ? (old.age + dt) : 0) : 0;
                const pulse = smooth(age / .045) * Math.exp(-age * 7) * (1 - smooth((age - .22) / .18));
                const target = (1 - smooth(Math.max(0, gap) / 30)) * (joined ? (reduced ? 0 : pulse * 1.9) : .55);
                const response = joined && target < (old?.amount ?? 0) ? 26 : 16;
                let amount = (old?.amount ?? 0) + (target - (old?.amount ?? 0)) * (reduced ? 1 : 1 - Math.exp(-response * dt));
                if (Math.abs(amount - target) < .001)
                    amount = target;
                else
                    moving = true;
                if (joined && age < .4 && !reduced)
                    moving = true;
                const ends = connectorEndpoints(a, b), length = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = (b.x - a.x) / length, ny = (b.y - a.y) / length;
                nextContacts.push({ key, x: (ends.from.x + ends.to.x) / 2, y: (ends.from.y + ends.to.y) / 2, nx, ny, span: Math.max(12, (Math.abs(nx) * Math.min(a.height, b.height) + Math.abs(ny) * Math.min(a.width, b.width)) * .52), amount, age, joined });
            }
    w.contacts = nextContacts.sort((a, b) => b.amount - a.amount).slice(0, 8);
    return moving;
}
export function worldDistance(w, p, radiusScale = 1) {
    const visible = w.bodies.filter(b => b.opacity > .001);
    if (!visible.length)
        return 1e6;
    const shapes = visible.map(b => ({ ...b, radius: b.radius * radiusScale }));
    if (w.mergeMode === "none")
        return field(p, shapes, 0);
    return Math.min(...materialGroups(shapes, 12).map(group => { const key = group.map(b => b.id).sort().join("|"), flat = w.backings.find(g => g.key === key)?.flat ?? 0; const rectangle = { ...group[0], ...bounds(group), radius: Math.min(...group.map(b => b.radius)) }; const raw = Math.max(field(p, group, 12), roundedDistance(p, { ...rectangle, radius: 0 })); return raw * (1 - flat) + roundedDistance(p, rectangle) * flat; }));
}
function spring(value, velocity, target, dt) {
    // Exact critically damped solution: stable across refresh rates and interruptions.
    const rate = 13, offset = value - target, decay = Math.exp(-rate * dt);
    const step = (velocity + rate * offset) * dt;
    return [target + (offset + step) * decay, (velocity - rate * step) * decay];
}
export function stepWorld(w, dt, reduced = false) {
    dt = clamp(dt, 0, .05);
    w.elapsed += dt;
    w.reactionAge += dt;
    let moving = false;
    for (const key of ["error", "success"]) {
        const target = w.state === key ? 1 : 0;
        w.stateBlend[key] += (target - w.stateBlend[key]) * (reduced ? 1 : 1 - Math.exp(-6 * dt));
        if (Math.abs(w.stateBlend[key] - target) > .0001)
            moving = true;
        else
            w.stateBlend[key] = target;
    }
    for (const b of w.bodies) {
        if (reduced) {
            b.x = b.target.x;
            b.y = b.target.y;
            b.velocity.x = b.velocity.y = 0;
        }
        else {
            [b.x, b.velocity.x] = spring(b.x, b.velocity.x, b.target.x, dt);
            [b.y, b.velocity.y] = spring(b.y, b.velocity.y, b.target.y, dt);
        }
        if (Math.hypot(b.x - b.target.x, b.y - b.target.y, b.velocity.x, b.velocity.y) > .03)
            moving = true;
        else {
            b.x = b.target.x;
            b.y = b.target.y;
            b.velocity.x = b.velocity.y = 0;
        }
    }
    w.hover += (w.hoverTarget - w.hover) * (reduced ? 1 : 1 - Math.exp(-10 * dt));
    if (Math.abs(w.hover - w.hoverTarget) > .001)
        moving = true;
    else
        w.hover = w.hoverTarget;
    for (const wave of w.waves)
        wave.age += dt;
    w.waves = w.waves.filter(wave => wave.age < (reduced ? .15 : 1.15));
    let alignedTarget = 0;
    const visible = w.bodies.filter(b => b.opacity > .001);
    moving = updateContacts(w, visible, dt, reduced) || moving;
    const connected = w.mergeMode === "none" ? visible.map(b => [b]) : materialGroups(visible, 12);
    const oldBackings = new Map(w.backings.map(g => [g.key, g]));
    w.backings = connected.map(group => { const key = group.map(b => b.id).sort().join("|"), first = group[0]; const aligned = group.length > 1 && materialGroups(group, 0).length === 1 && (group.every(b => Math.abs(b.y - first.y) < .5 && Math.abs(b.height - first.height) < .5) || group.every(b => Math.abs(b.x - first.x) < .5 && Math.abs(b.width - first.width) < .5)); const target = aligned ? 1 : 0; let flat = oldBackings.get(key)?.flat ?? 0; flat += (target - flat) * (reduced ? 1 : 1 - Math.exp(-w.joinRate * dt)); if (Math.abs(flat - target) < .0001)
        flat = target;
    else
        moving = true; return { key, ids: group.map(b => b.id), ...bounds(group), radius: Math.min(...group.map(b => b.radius)), flat }; });
    if (w.mergeMode === "backing" && visible.length > 1 && connected.length === 1) {
        const first = visible[0];
        const horizontal = visible.every(b => Math.abs(b.y - first.y) < .5 && Math.abs(b.height - first.height) < .5);
        const vertical = visible.every(b => Math.abs(b.x - first.x) < .5 && Math.abs(b.width - first.width) < .5);
        if (horizontal || vertical)
            alignedTarget = 1;
    }
    w.alignedBlend += (alignedTarget - w.alignedBlend) * (reduced ? 1 : 1 - Math.exp(-w.joinRate * dt));
    if (Math.abs(w.alignedBlend - alignedTarget) < .0001)
        w.alignedBlend = alignedTarget;
    else
        moving = true;
    const blend = reduced ? 1 : 1 - Math.exp(-9 * dt);
    const groups = connected.map(group => bounds(group));
    if (w.lights.length === 0)
        w.lights = groups.map(b => ({ ...b, weight: 1 }));
    for (let i = 0; i < Math.max(w.lights.length, groups.length); i++) {
        const target = groups[i];
        if (!w.lights[i])
            w.lights[i] = { ...target, weight: 0 };
        const light = w.lights[i];
        if (target)
            for (const key of ["x", "y", "width", "height"]) {
                light[key] += (target[key] - light[key]) * blend;
                if (Math.abs(target[key] - light[key]) > .02)
                    moving = true;
                else
                    light[key] = target[key];
            }
        const weight = target ? 1 : 0;
        light.weight += (weight - light.weight) * blend;
        if (Math.abs(light.weight - weight) > .001)
            moving = true;
        else
            light.weight = weight;
    }
    const load = w.loading;
    load.rate += (load.targetRate - load.rate) * (1 - Math.exp(-4 * dt));
    if (Math.abs(load.rate - load.targetRate) > .05)
        moving = true;
    else
        load.rate = load.targetRate;
    if (load.running) {
        if (!reduced)
            load.phase += dt * (.1 + Math.log2(1 + load.rate) * .055);
        load.progress = clamp(load.progress + dt * load.rate / (8 * 128), 0, 1);
        if (load.progress >= 1) {
            load.running = false;
            load.completed = true;
            setMaterialState(w, "success", true);
        }
        else
            moving = true;
    }
    if (w.message.active) {
        const m = w.message, b = w.bodies.find(b => b.id === m.bodyId);
        m.age += dt;
        const travel = 1 - Math.exp(-Math.max(0, m.age - .012) * 22);
        const expand = 1 - Math.exp(-Math.max(0, m.age - .01) * 26);
        const unfold = 1 - Math.exp(-Math.max(0, m.age - .035) * 24);
        const settle = Math.exp(-Math.max(0, m.age - .16) * 24) * Math.sin(Math.max(0, m.age - .16) * 34);
        if (b) {
            b.x = m.origin.x + (m.destination.x - m.origin.x) * travel;
            b.y = m.origin.y + (m.destination.y - m.origin.y) * travel - .35 * settle;
            b.width = 36 + (m.width - 36) * expand + .6 * settle;
            b.height = 22 + (m.height - 22) * unfold - .35 * settle;
            b.radius = 10 + 2 * unfold;
            b.opacity = smooth(m.age / .08);
            b.target = { x: b.x, y: b.y };
            b.velocity = { x: 0, y: 0 };
        }
        if (m.age >= .38) {
            m.active = false;
            m.delivered = true;
            if (b) {
                b.x = m.destination.x;
                b.y = m.destination.y;
                b.width = m.width;
                b.height = m.height;
                b.radius = 12;
                b.target = { ...m.destination };
            }
        }
        else
            moving = true;
    }
    if (reduced) {
        w.reactionAge = 10;
        if (w.message.active) {
            w.message.age = .38;
        }
    }
    const reaction = (w.state === "error" || w.state === "success") && w.reactionAge < 1.5 && !reduced;
    return moving || reaction || w.waves.length > 0;
}
export function sendMessage(w, origin = { x: 328, y: 220 }, bodyId = "message-b", destination = { x: 269, y: 135 }, width = 202, height = 64, sourceId = null) {
    if (w.message.active)
        return false;
    w.message = { age: 0, active: true, delivered: false, origin, bodyId, sourceId, destination, width, height };
    const b = w.bodies.find(b => b.id === bodyId);
    if (b) {
        b.x = origin.x;
        b.y = origin.y;
        b.width = 36;
        b.height = 22;
        b.radius = 10;
        b.opacity = 0;
        b.target = { x: b.x, y: b.y };
        b.velocity = { x: 0, y: 0 };
    }
    return true;
}
export function press(w, p) {
    w.pointer = p;
    w.waves.push({ ...p, age: 0 });
    if (w.waves.length > 6)
        w.waves.shift();
}
export function rgb(hex) {
    const safe = /^#[\da-f]{6}$/i.test(hex) ? hex : "#906CFF";
    return [parseInt(safe.slice(1, 3), 16) / 255, parseInt(safe.slice(3, 5), 16) / 255, parseInt(safe.slice(5, 7), 16) / 255];
}
