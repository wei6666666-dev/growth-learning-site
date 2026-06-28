// Growth 的所有数据都存在浏览器 localStorage 中。
// 这意味着刷新页面后，任务、笔记、视频、错题和素材仍然会保留在本机浏览器里。
const STORAGE_KEY = "growth-interactive-learning";
const THEME_KEY = "growth-theme";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const root = document.documentElement;
const toast = $("#toast");
const globalSearch = $("#globalSearch");
const initialPage = document.body.dataset.initialPage || (location.pathname.endsWith("physics.html") ? "library" : "home");
let physicsDataStatus = {
  loading: true,
  error: "",
};

const physicsCategories = ["运动的描述", "匀变速直线运动", "相互作用", "牛顿运动定律", "实验专区", "视频课程"];
const materialThemes = ["成长", "坚持", "挫折", "亲情", "青春", "责任"];

const categoryIcons = {
  "运动的描述": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17c4-8 10-10 16-4"/><circle cx="5" cy="17" r="1.6"/><circle cx="13" cy="10" r="1.4"/><circle cx="20" cy="13" r="1.6"/></svg>`,
  "匀变速直线运动": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16h12"/><path d="m14 12 4 4-4 4"/><path d="M5 9h7"/></svg>`,
  "相互作用": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16"/><path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/></svg>`,
  "牛顿运动定律": `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="9" width="8" height="7" rx="1.5"/><path d="M12 9V4"/><path d="m10 6 2-2 2 2"/><path d="M16 12h5"/><path d="m19 10 2 2-2 2"/><path d="M8 12H3"/><path d="m5 10-2 2 2 2"/></svg>`,
  "实验专区": `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6"/><path d="M10 3v7l-4 7a3 3 0 0 0 2.6 4h6.8A3 3 0 0 0 18 17l-4-7V3"/><path d="M8 16h8"/></svg>`,
  "视频课程": `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="3"/><path d="m10 9 5 3-5 3Z"/></svg>`,
};

const physicsTags = {
  particle: ["Model", "Simplify"],
  reference: ["Frame", "Relative"],
  displacement: ["Vector", "Position Change"],
  velocity: ["Motion", "Rate"],
  acceleration: ["Acceleration", "Δv / Δt"],
  uniform: ["Motion Law", "Constant a"],
  freefall: ["g", "Vertical Motion"],
  force: ["Interaction", "Vector"],
  gravity: ["G = mg", "Earth"],
  elastic: ["F = kx", "Contact"],
  friction: ["Contact", "Direction"],
  newton1: ["Inertia", "ΣF = 0"],
  newton2: ["F = ma", "Core Law"],
  newton3: ["Pair Force", "Interaction"],
  ticker: ["Experiment", "Time Dots"],
  "newton-lab": ["Experiment", "Control Variables"],
};

const formulaDetails = {
  displacement: [{ formula: "Δx = x₂ - x₁", explain: "Δx 表示位移，x₂ 是末位置，x₁ 是初位置。" }],
  velocity: [{ formula: "v = Δx / Δt", explain: "v 表示平均速度，Δx 是位移，Δt 是所用时间。" }],
  acceleration: [{ formula: "a = Δv / Δt", explain: "a 表示加速度，Δv 是速度变化量，Δt 是所用时间。" }],
  uniform: [
    { formula: "v = v₀ + at", explain: "v₀ 是初速度，a 是加速度，t 是时间。" },
    { formula: "x = v₀t + 1/2at²", explain: "x 表示位移，适用于匀变速直线运动。" },
    { formula: "v² - v₀² = 2ax", explain: "当题目不直接给时间时，这个公式常用。" },
  ],
  freefall: [
    { formula: "v = gt", explain: "自由落体从静止开始，g 为重力加速度。" },
    { formula: "h = 1/2gt²", explain: "h 表示下落高度，忽略空气阻力。" },
  ],
  force: [{ formula: "F", explain: "力是矢量，要同时关注大小、方向和作用点。" }],
  gravity: [{ formula: "G = mg", explain: "G 是重力，m 是质量，g 是重力加速度。" }],
  elastic: [{ formula: "F = kx", explain: "k 是劲度系数，x 是弹簧形变量。" }],
  friction: [{ formula: "f = μN", explain: "f 是滑动摩擦力，μ 是动摩擦因数，N 是正压力。" }],
  newton1: [{ formula: "ΣF = 0 → v 不变", explain: "合外力为零时，物体保持静止或匀速直线运动。" }],
  newton2: [{ formula: "F = ma", explain: "F 是合外力，m 是质量，a 是加速度。" }],
  newton3: [{ formula: "F_AB = -F_BA", explain: "作用力和反作用力大小相等、方向相反、作用在两个物体上。" }],
};

let knowledgePoints = [
  point("particle", "质点", "运动的描述", "入门", "在研究运动时，把物体看成有质量但没有大小和形状的点。", "当物体的大小和形状对研究的问题影响很小时，可以把物体抽象为质点。", "无固定公式，关键是判断能否忽略大小和形状。", "不是小物体才一定能看作质点，也不是大物体一定不能看作质点。", "研究地球绕太阳公转时，地球通常可以看作质点。"),
  point("reference", "参考系", "运动的描述", "入门", "描述物体运动时，被选作标准的物体或物体系。", "为了判断物体是否运动，需要先选定参考系。", "运动状态与参考系有关。", "同一物体相对不同参考系，运动描述可能不同。", "坐在行驶列车上的人，相对列车静止，相对地面运动。"),
  point("time-moment", "时间与时刻", "运动的描述", "入门", "区分一个过程持续多久，以及某一个瞬间发生了什么。", "时刻表示时间轴上的一个点，时间间隔表示两个时刻之间的一段过程。", "Δt = t2 - t1", "时刻不是时间间隔；第 3 秒末和前 3 秒含义不同。", "8:00 上课是时刻，上一节 40 分钟课是时间间隔。"),
  point("displacement", "路程与位移", "运动的描述", "重点", "路程看实际轨迹长度，位移看初位置到末位置的有向变化。", "路程是物体运动轨迹的长度，位移是从初位置指向末位置的有向线段。", "Δx = x2 - x1", "位移不是路程；位移有方向，路程没有方向。", "绕操场跑一圈回到起点，路程是一圈长度，位移为 0。"),
  point("velocity", "速度", "运动的描述", "重点", "描述物体位置变化快慢和方向的物理量。", "速度等于位移与发生这段位移所用时间的比值。", "v = Δx / Δt", "平均速度是位移除以时间，不是路程除以时间。", "向东位移 20 m 用时 4 s，平均速度为 5 m/s，方向向东。"),
  point("avg-instant-velocity", "平均速度与瞬时速度", "运动的描述", "重点", "平均速度描述一段过程，瞬时速度描述某一时刻。", "平均速度对应时间间隔，瞬时速度对应某一时刻或某一位置的运动快慢和方向。", "v = Δx / Δt", "平均速度不等于平均速率；瞬时速度不是一段时间的平均值。", "测速仪显示汽车此刻 60 km/h，更接近瞬时速度。"),
  point("acceleration", "加速度", "运动的描述", "重点", "描述速度变化快慢和方向的物理量。", "加速度等于速度变化量与发生这一变化所用时间的比值。", "a = Δv / Δt", "加速度大不一定速度大，它表示速度变化得快。", "汽车刹车时速度变小，但加速度方向与速度方向相反。"),
  point("uniform", "匀变速直线运动", "匀变速直线运动", "重点", "加速度保持不变，且运动轨迹为直线的运动。", "在任意相等时间内速度变化量相等的直线运动。", "v = v0 + at；x = v0t + 1/2at²；v² - v0² = 2ax", "公式要先规定正方向，再带入带符号的物理量。", "小车沿斜面下滑时，可近似看作匀加速直线运动。"),
  point("freefall", "自由落体运动", "匀变速直线运动", "重点", "只在重力作用下，从静止开始下落的运动。", "忽略空气阻力时，物体只受重力作用的下落运动。", "v = gt；h = 1/2gt²；v² = 2gh", "自由落体初速度为 0，且加速度为重力加速度 g。", "同一地点轻重不同的小球在真空中同时落地。"),
  point("force", "力", "相互作用", "入门", "物体对物体的作用，会改变物体的运动状态或形变。", "力是物体间的相互作用，具有大小、方向和作用点。", "单位：牛顿，符号 N。", "力不能离开物体单独存在，有施力物体也有受力物体。", "手推桌子时，手对桌子施力，桌子也对手施力。"),
  point("gravity", "重力", "相互作用", "基础", "由于地球吸引而使物体受到的力，方向竖直向下。", "物体由于地球吸引而受到的力叫重力。", "G = mg", "重力方向是竖直向下，不一定指向接触面的垂直方向。", "质量 2 kg 的物体，重力约为 19.6 N。"),
  point("elastic", "弹力", "相互作用", "基础", "发生弹性形变的物体，为恢复原状而对接触物体产生的力。", "接触并发生弹性形变时，物体间会产生弹力。", "弹簧弹力常用 F = kx。", "有接触不一定有弹力，还要看是否发生挤压或拉伸形变。", "桌面对书的支持力，本质上是弹力。"),
  point("friction", "摩擦力", "相互作用", "难点", "阻碍物体相对运动或相对运动趋势的力。", "两个接触面粗糙且相互挤压时，可能产生摩擦力。", "滑动摩擦力 f = μN。", "静摩擦力不一定等于 μN，要由受力平衡或运动状态判断。", "人走路时，地面对脚的静摩擦力帮助人前进。"),
  point("force-composition", "力的合成与分解", "相互作用", "重点", "把多个力等效成一个力，或把一个力拆成两个方向上的分力。", "合力与分力在作用效果上等效，遵循平行四边形定则。", "Fx = Fcosθ；Fy = Fsinθ", "合力不一定等于两个力大小相加；分解方向要根据解题需要选择。", "斜拉箱子时，拉力可分解为水平向前和竖直向上的两个分力。"),
  point("newton1", "牛顿第一定律", "牛顿运动定律", "重点", "物体不受外力或合外力为零时，保持静止或匀速直线运动状态。", "惯性定律说明力不是维持运动的原因，而是改变运动状态的原因。", "ΣF = 0 时，v 保持不变。", "没有力，物体也可以保持运动。", "冰面上推出的冰壶会继续滑行一段距离。"),
  point("newton2", "牛顿第二定律", "牛顿运动定律", "核心", "物体加速度与所受合外力成正比，与质量成反比。", "物体的加速度方向与合外力方向相同。", "F = ma", "公式中的 F 是合外力，不是某一个单独的力。", "同样的推力作用在不同质量的小车上，质量越小加速度越大。"),
  point("newton3", "牛顿第三定律", "牛顿运动定律", "重点", "两个物体间的作用力和反作用力大小相等、方向相反。", "作用力和反作用力总是同时产生、同时消失，作用在两个物体上。", "F_AB = -F_BA", "作用力和反作用力作用在不同物体上，不能相互抵消。", "人向后蹬地，地面对人产生向前的反作用力。"),
  point("ticker", "打点计时器", "实验专区", "基础", "用相等时间间隔留下纸带点迹，帮助研究物体的直线运动。", "打点计时器是一种按固定频率在纸带上打点的实验仪器。", "相邻计数点时间间隔常取 T，要结合实验频率判断。", "不要把相邻点和相邻计数点混淆，计算前先确认取点方式。", "通过纸带上相邻计数点间距的变化，判断小车是否做加速运动。"),
  point("newton-lab", "验证牛顿第二定律", "实验专区", "难点", "控制变量研究加速度、合外力和质量之间的关系。", "通过改变拉力或小车质量，观察加速度变化来验证 F = ma。", "a 与 F 成正比，a 与 m 成反比。", "实验中要注意平衡摩擦力，并让砂桶质量远小于小车质量。", "保持小车质量不变，增大拉力时，加速度应随之增大。"),
];

const pointDetails = {
  particle: {
    supplement: "质点是一种理想化模型。它不是说物体真的没有大小，而是在当前问题里，物体的形状、转动和各部分差异不会明显影响结论。判断能不能看作质点，要看研究目的：研究平动轨迹时常可以，研究物体自身转动或形变时通常不可以。",
    examples: ["导航软件计算汽车从家到学校的路线时，汽车可以近似看作质点。", "研究运动员绕操场跑一圈所用时间时，运动员可以看作质点。", "研究跳水运动员空中翻转动作时，不能简单看作质点，因为姿态和转动很重要。"],
  },
  reference: {
    supplement: "参考系决定了你如何描述运动。物体是否运动、向哪个方向运动、速度大小是多少，都必须先说明相对于谁来观察。高中阶段通常默认地面为参考系，但遇到车、船、电梯等情境时，要特别留意题目选取的参考系。",
    examples: ["坐在公交车上的书包相对座椅静止，但相对路边树木是运动的。", "电梯上升时，站在电梯里的人相对电梯静止，相对楼层在向上运动。", "在行驶火车上向前走的人，相对火车和相对地面的速度不同。"],
  },
  displacement: {
    supplement: "位移只关心初位置和末位置，是从起点指向终点的有向线段。它有大小也有方向，所以是矢量。路程则是实际走过轨迹的长度，是标量。做题时看到“返回原点”“绕一圈”等字眼，要立即想到位移可能为零。",
    examples: ["绕操场跑一整圈回到起点，路程是一圈长度，但位移为 0。", "从教室门口走到讲台，即使中途绕开同学，位移仍由门口指向讲台。", "手机地图显示直线距离更接近位移大小，导航路线长度更接近路程。"],
  },
  velocity: {
    supplement: "速度描述位置变化的快慢和方向。平均速度用位移除以时间，瞬时速度描述某一时刻运动快慢。日常说的“车速”通常更接近速率，只强调大小；物理中的速度必须考虑方向。",
    examples: ["汽车向东行驶 10 m/s 和向西行驶 10 m/s，速率相同但速度不同。", "跑步机显示的配速主要反映运动快慢，不反映方向。", "高铁进站时速度大小逐渐变小，方向仍沿轨道向前。"],
  },
  acceleration: {
    supplement: "加速度描述速度变化得有多快。它不直接表示运动快慢，而表示速度变化快慢。速度变大、变小或方向改变，都说明存在加速度。加速度方向与速度方向相同会加速，方向相反会减速，方向垂直时可能改变运动方向。",
    examples: ["汽车起步时速度增加，有向前的加速度。", "刹车时车仍向前运动，但加速度方向向后。", "电梯刚启动和刚停止时，人会感觉身体被压或发轻，这与加速度有关。"],
  },
  uniform: {
    supplement: "匀变速直线运动的核心是“加速度恒定”。因为运动在一条直线上，所以可以先规定正方向，再把速度、位移、加速度都带符号处理。公式之间可以互相联系，选公式时看题目给了哪些量、要求哪个量。",
    examples: ["小车沿光滑斜面下滑，可近似看作匀加速直线运动。", "汽车在笔直道路上均匀加速，速度每秒增加相同数值。", "列车进站时若减速度近似恒定，可看作匀减速直线运动。"],
  },
  freefall: {
    supplement: "自由落体是匀变速直线运动的特殊情况：初速度为 0，加速度为 g，方向竖直向下。它要求只受重力作用，实际生活中空气阻力会影响纸片、羽毛等轻物体，所以题目常会说明“忽略空气阻力”。",
    examples: ["从手中静止释放小球，小球下落过程可近似看作自由落体。", "同一地点，真空中羽毛和铁球会同时落地。", "雨滴下落初期会加速，但后期空气阻力明显，不能一直当作自由落体。"],
  },
  force: {
    supplement: "力是物体间的相互作用，它能改变物体运动状态，也能使物体发生形变。分析力时要说清楚施力物体、受力物体、方向和作用点。力不是维持运动的原因，而是改变运动状态的原因。",
    examples: ["手推门时，手对门有力，门也对手有反作用力。", "足球被踢出去，是因为脚在短时间内对足球施加了力。", "坐在椅子上时，椅面对人有支持力。"],
  },
  gravity: {
    supplement: "重力来源于地球对物体的吸引，方向总是竖直向下。重力大小与质量成正比，同一地点 g 近似不变。重心是重力作用的等效点，形状规则且质量分布均匀的物体，重心通常在几何中心。",
    examples: ["书从桌边掉落，是因为受到重力作用。", "体重秤显示的读数与人受到的重力有关。", "篮球投出后仍会向下落，是重力不断改变它的运动方向。"],
  },
  elastic: {
    supplement: "弹力产生需要两个条件：接触，以及发生弹性形变。支持力、压力、拉力都常常属于弹力。弹簧在弹性限度内，弹力大小与形变量成正比，方向总是阻碍形变。",
    examples: ["书放在桌上，桌面微小形变后给书向上的支持力。", "拉橡皮筋时，橡皮筋对手有向回收缩的弹力。", "弹簧测力计能测力，是利用弹簧形变量与拉力的关系。"],
  },
  friction: {
    supplement: "摩擦力总是阻碍相对运动或相对运动趋势。滑动摩擦力大小常用 f = μN，方向与相对运动方向相反。静摩擦力更灵活，它会根据需要在一定范围内变化，方向要根据相对运动趋势判断。",
    examples: ["走路时脚向后蹬地，地面对脚的静摩擦力向前，帮助人前进。", "刹车时轮胎和地面之间的摩擦力使车减速。", "用橡皮擦字，橡皮与纸面之间的摩擦让铅笔痕迹脱落。"],
  },
  newton1: {
    supplement: "牛顿第一定律说明物体具有惯性：不受外力或合外力为零时，运动状态不会改变。它纠正了“有力才会运动”的直觉误区。现实中物体会停下，通常是因为摩擦力、空气阻力等外力在改变它的运动状态。",
    examples: ["公交车突然刹车时，人会向前倾，这是惯性的表现。", "桌布快速抽出时，杯子可能几乎留在原处。", "冰面上的冰壶能滑很远，因为阻力较小，运动状态改变得慢。"],
  },
  newton2: {
    supplement: "牛顿第二定律把力和运动变化联系起来。合外力越大，加速度越大；质量越大，同样的力产生的加速度越小。应用时一定要先选研究对象、受力分析，再沿选定方向列 F = ma。",
    examples: ["空购物车比装满货物的购物车更容易推得快。", "同样用力踢足球和实心球，足球的加速度更大。", "电动车载人越多，起步通常越慢，因为总质量变大。"],
  },
  newton3: {
    supplement: "作用力和反作用力总是成对出现，大小相等、方向相反、作用在两个不同物体上。它们不能相互抵消，因为抵消必须发生在同一个物体受到的两个力之间。分析时要区分“相互作用力”和“平衡力”。",
    examples: ["游泳时手向后推水，水向前推人。", "火箭向后喷气，气体反过来推动火箭向前。", "脚踢足球时，脚给球力，球也给脚力，所以脚会疼。"],
  },
  ticker: {
    supplement: "打点计时器能把时间信息记录在纸带上。相邻点之间时间相等，纸带上点距越来越大，说明速度越来越大。处理纸带时要分清“点”和“计数点”，并用中间时刻速度近似法减少误差。",
    examples: ["小车拖着纸带运动，点距逐渐变大，说明小车在加速。", "点距几乎相等时，可判断物体近似匀速直线运动。", "实验中纸带歪斜或阻力过大，会影响测量结果。"],
  },
  "newton-lab": {
    supplement: "验证牛顿第二定律常用控制变量法：保持质量不变研究 a 与 F 的关系，保持合外力不变研究 a 与 m 的关系。实验前通常要平衡摩擦力，让细绳拉力尽量等于小车所受合外力。",
    examples: ["用同一辆小车，逐渐增加钩码质量，观察纸带计算出的加速度如何变化。", "保持拉力近似不变，在小车上加砝码，发现加速度变小。", "如果没有平衡摩擦力，图像可能不过原点。"],
  },
};

const richPointDetails = {
  particle: rich("研究运动时，把物体简化成只有质量、没有大小和形状的点，目的是先抓住运动整体。", [], "没有固定计算公式。重点是判断物体大小、形状、转动是否会影响研究结果。", ["质点是模型，不是说物体真的变成一个点。", "能不能看作质点取决于研究问题，不取决于物体本身大小。"], "研究地球绕太阳公转时，地球半径远小于轨道半径，可把地球看作质点；但研究地球自转时不能看作质点。", "先问自己：这个问题关心整体位置变化，还是关心物体各部分的形状和转动？"),
  reference: rich("描述运动前选定的标准物体叫参考系。离开参考系，就无法判断物体是否运动。", [], "常默认地面为参考系；若题目出现车、船、电梯，要先确认相对谁观察。", ["同一物体在不同参考系下运动状态可能不同。", "说“静止”或“运动”时必须暗含参考系。"], "坐在行驶公交车上的书包相对座椅静止，相对路边树木运动。", "做题第一步先补一句：以谁为参考系。"),
  "time-moment": rich("时刻是时间轴上的一个点，时间是两个时刻之间的一段间隔。", [{ formula: "Δt = t₂ - t₁", explain: "Δt 表示时间间隔，t₂ 是末时刻，t₁ 是初时刻。" }], "t 的单位是秒，符号 s。时刻对应某个瞬间，时间间隔对应持续过程。", ["第 3 秒末是时刻，前 3 秒是时间。", "第 3 秒内表示从 2 s 末到 3 s 末，时间为 1 s。"], "7:30 到校是时刻；从家到学校用了 20 min 是时间间隔。", "看到“初、末、第几秒末”想时刻，看到“内、经过、持续”想时间。"),
  displacement: rich("路程是实际走过路径的长度，位移是初位置指向末位置的有向线段。", [{ formula: "Δx = x₂ - x₁", explain: "Δx 是位移，x₂ 是末位置，x₁ 是初位置；单位都是 m。" }], "路程单位是 m，是标量；位移单位也是 m，但它是矢量，有大小和方向。", ["路程不可能为负，位移可以取正负表示方向。", "绕一圈回到起点时，路程不为 0，位移为 0。"], "从家向东走 300 m 到书店，再向西走 100 m，路程 400 m，位移大小 200 m，方向向东。", "把起点和终点画出来，位移只看这两个点。"),
  velocity: rich("速度表示位置变化的快慢和方向，是描述运动状态的重要物理量。", [{ formula: "v = Δx / Δt", explain: "v 是平均速度，Δx 是位移，Δt 是时间间隔；单位 m/s。" }], "速度是矢量，单位常用 m/s，也可用 km/h。方向就是位移方向或瞬时运动方向。", ["速度和速率不同，速率只表示大小。", "平均速度要用位移除以时间，不是路程除以时间。"], "一名同学向东位移 60 m，用时 12 s，平均速度为 5 m/s，方向向东。", "速度一定要带方向理解，别只盯着数字大小。"),
  "avg-instant-velocity": rich("平均速度描述一段时间内的整体运动，瞬时速度描述某一时刻的运动状态。", [{ formula: "v̄ = Δx / Δt", explain: "v̄ 是平均速度，Δx 是这段时间的位移，Δt 是这段时间。" }], "平均速度单位 m/s，瞬时速度单位 m/s。瞬时速度可理解为时间间隔非常小时的平均速度极限。", ["平均速度不是平均速率，平均速率等于路程除以时间。", "测速仪显示的是瞬时速率，不一定包含方向。"], "汽车 10 s 内向前位移 120 m，平均速度为 12 m/s；某一瞬间仪表盘显示 50 km/h，是瞬时速率。", "平均看“一段”，瞬时看“一个点”。"),
  acceleration: rich("加速度表示速度变化的快慢和方向，不直接表示速度大小。", [{ formula: "a = Δv / Δt", explain: "a 是加速度，Δv 是速度变化量，Δt 是时间；单位 m/s²。" }], "加速度是矢量。方向与速度变化量方向一致，不一定与速度方向一致。", ["加速度大不代表速度大，只代表速度变化快。", "减速运动也有加速度，加速度方向通常与速度方向相反。"], "汽车速度从 2 m/s 增加到 10 m/s，用时 4 s，加速度为 2 m/s²。", "判断加速度方向，看速度是怎样变化的。"),
  uniform: rich("加速度保持不变、运动轨迹为直线的运动叫匀变速直线运动。", [{ formula: "v = v₀ + at", explain: "v₀ 是初速度，v 是末速度，a 是加速度，t 是时间。" }, { formula: "x = v₀t + 1/2at²", explain: "x 是位移，适合求一段时间内的位置变化。" }, { formula: "v² - v₀² = 2ax", explain: "当题目没有时间 t 时常用。" }], "所有量都要先规定正方向，再带正负号代入，单位分别为 m/s、m/s²、s、m。", ["公式中的 x 是位移，不一定是路程。", "减速时 a 常取负值，不要只代大小。"], "小车初速度 0，加速度 2 m/s²，运动 3 s 后速度 v = 6 m/s，位移 x = 9 m。", "先选正方向，再列已知量，最后选最少未知量的公式。"),
  freefall: rich("物体只在重力作用下，从静止开始下落的运动叫自由落体运动。", [{ formula: "v = gt", explain: "v 是下落 t 秒后的速度，g 是重力加速度。" }, { formula: "h = 1/2gt²", explain: "h 是下落高度，t 是下落时间。" }], "g 常取 9.8 m/s²，粗略计算可取 10 m/s²。方向竖直向下。", ["自由落体要求初速度为 0。", "空气阻力明显时，不能直接当自由落体。"], "小球从静止释放，取 g = 10 m/s²，2 s 后速度为 20 m/s，下落高度为 20 m。", "把自由落体看成初速度为 0、加速度为 g 的匀加速直线运动。"),
  gravity: rich("重力是物体由于地球吸引而受到的力，方向竖直向下。", [{ formula: "G = mg", explain: "G 是重力，m 是质量，g 是重力加速度；G 单位 N，m 单位 kg。" }], "重力大小与质量成正比，方向竖直向下，作用点可等效认为在重心。", ["重力方向是竖直向下，不是垂直接触面。", "质量单位是 kg，重力单位是 N，不能混用。"], "质量 5 kg 的书包，取 g = 10 N/kg，重力 G = 50 N，方向竖直向下。", "看到质量和重力，先统一单位，再用 G = mg。"),
  elastic: rich("发生弹性形变的物体，为恢复原状而对接触物体产生的力叫弹力。", [{ formula: "F = kx", explain: "F 是弹簧弹力，k 是劲度系数，x 是形变量；只适用于弹性限度内。" }], "弹力单位 N。支持力、压力、拉力常属于弹力，方向通常垂直接触面或沿绳、弹簧方向。", ["有接触不一定有弹力，还要有形变。", "支持力方向不是总向上，而是垂直接触面。"], "书放在水平桌面上，桌面对书的支持力竖直向上，大小在平衡时等于书的重力。", "找弹力先看接触，再看形变方向。"),
  friction: rich("摩擦力阻碍物体间的相对运动或相对运动趋势。", [{ formula: "f = μN", explain: "f 是滑动摩擦力，μ 是动摩擦因数，N 是正压力；单位 N。" }], "摩擦力方向沿接触面。滑动摩擦力方向与相对运动方向相反；静摩擦力方向与相对运动趋势相反。", ["静摩擦力不一定等于 μN。", "摩擦力不一定总是阻碍物体运动，它阻碍的是相对运动或趋势。"], "人走路时脚有向后滑的趋势，地面对脚的静摩擦力向前，帮助人前进。", "判断摩擦力方向时，先判断相对运动或相对运动趋势。"),
  "force-composition": rich("力的合成是用一个力等效替代几个力；力的分解是把一个力等效拆成几个方向上的分力。", [{ formula: "Fx = Fcosθ", explain: "Fx 是 F 在 x 方向的分力，θ 是 F 与 x 方向夹角。" }, { formula: "Fy = Fsinθ", explain: "Fy 是 F 在 y 方向的分力，适用于直角分解。" }], "力的单位是 N。合力和分力都是矢量，要考虑方向，常用平行四边形定则或正交分解。", ["合力大小不一定等于两个力大小相加。", "分解方向不是随便选，通常沿运动方向和垂直运动方向。"], "用斜向上的力拉箱子，拉力可分解为水平向前的分力和竖直向上的分力，水平分力帮助箱子前进。", "遇到斜面或斜拉力，优先想到正交分解。"),
  newton1: rich("物体不受外力或合外力为零时，会保持静止或匀速直线运动状态。", [{ formula: "ΣF = 0 → v 不变", explain: "ΣF 表示合外力，v 不变表示速度大小和方向都不变。" }], "惯性是物体保持原有运动状态的性质，质量越大惯性越大。", ["力不是维持运动的原因，而是改变运动状态的原因。", "静止和匀速直线运动都属于平衡状态。"], "公交车突然刹车，人的脚随车减速，上身由于惯性仍保持向前运动，所以人会前倾。", "用牛顿第一定律纠正直觉：没有合外力，速度不会自己变。"),
  newton2: rich("物体的加速度与所受合外力成正比，与质量成反比，方向与合外力方向相同。", [{ formula: "F = ma", explain: "F 是合外力，m 是质量，a 是加速度；单位分别为 N、kg、m/s²。" }], "F 必须是研究对象受到的合外力，不是某一个单独的力。", ["先受力分析，再列 F = ma。", "加速度方向与合外力方向相同，不一定与速度方向相同。"], "质量 2 kg 的小车受到 6 N 合外力，加速度 a = F/m = 3 m/s²。", "牛顿第二定律题目的核心步骤是：对象、受力、方向、方程。"),
  newton3: rich("两个物体之间的作用力和反作用力总是大小相等、方向相反、作用在不同物体上。", [{ formula: "F_AB = -F_BA", explain: "A 对 B 的力与 B 对 A 的力等大反向，分别作用在两个物体上。" }], "作用力和反作用力性质相同、同时产生、同时消失，但不能相互抵消。", ["作用力和反作用力作用在不同物体上。", "平衡力作用在同一物体上，容易和相互作用力混淆。"], "人向后蹬地，脚给地面向后的力，地面给人向前的力，所以人能向前走。", "区分第三定律和平衡力：先看是不是同一个受力物体。"),
};

const workedExamples = {
  particle: ["判断研究“火车从北京到上海的运行时间”时，火车能否看作质点。", "可以。此时只关心火车整体位置变化，火车长度和形状对运行时间影响很小。"],
  reference: ["坐在车上的人看到路边树向后退，这句话选的参考系是什么？", "选的是车或车上的人为参考系。相对车，树的位置向后变化，所以看起来向后运动。"],
  "time-moment": ["某同学 8:00 到校，8:00 到 8:20 早读。指出时刻和时间间隔。", "8:00 是时刻；8:00 到 8:20 是时间间隔，长度为 20 min。"],
  displacement: ["同学向东走 30 m，再向西走 10 m，求路程和位移。", "路程为 30 + 10 = 40 m；位移大小为 20 m，方向向东。"],
  velocity: ["物体向东位移 50 m，用时 10 s，求平均速度。", "v = Δx / Δt = 50 / 10 = 5 m/s，方向向东。"],
  "avg-instant-velocity": ["汽车 5 s 内位移 100 m，某一刻速度表显示 72 km/h。分别对应什么速度？", "100 / 5 = 20 m/s 是平均速度；速度表显示的是瞬时速率。"],
  acceleration: ["汽车速度从 4 m/s 增加到 16 m/s，用时 6 s，求加速度。", "a = Δv / Δt = (16 - 4) / 6 = 2 m/s²，方向与速度增加方向相同。"],
  uniform: ["小车由静止开始以 2 m/s² 加速，3 s 后速度和位移是多少？", "v = at = 6 m/s；x = 1/2at² = 9 m。"],
  freefall: ["小球从静止释放，取 g = 10 m/s²，2 s 后速度和下落高度是多少？", "v = gt = 20 m/s；h = 1/2gt² = 20 m。"],
  gravity: ["质量 3 kg 的物体，取 g = 10 N/kg，重力多大？", "G = mg = 3 × 10 = 30 N，方向竖直向下。"],
  elastic: ["弹簧劲度系数 200 N/m，伸长 0.05 m，弹力多大？", "F = kx = 200 × 0.05 = 10 N，方向与形变方向相反。"],
  friction: ["木块在水平面上滑动，N = 20 N，μ = 0.3，滑动摩擦力多大？", "f = μN = 0.3 × 20 = 6 N，方向与相对运动方向相反。"],
  "force-composition": ["用 10 N 的力与水平方向成 37° 拉物体，求水平分力，取 cos37° = 0.8。", "Fx = Fcosθ = 10 × 0.8 = 8 N，方向水平向前。"],
  newton1: ["水平冰面上冰壶几乎不受阻力时会怎样运动？", "若合外力近似为 0，它会保持原来的速度做匀速直线运动。"],
  newton2: ["质量 4 kg 的物体受到 12 N 合外力，加速度多大？", "a = F / m = 12 / 4 = 3 m/s²，方向与合外力方向相同。"],
  newton3: ["人向后蹬地为什么能向前走？", "脚给地面向后的力，地面同时给脚向前的反作用力，推动人前进。"],
};

function rich(definition, formulas, quantities, mistakes, example, tip) {
  return { definition, formulas, quantities, mistakes, example, tip };
}

const defaultState = {
  activePage: "home",
  activeCategory: "运动的描述",
  activeTheme: "成长",
  search: "",
  tasks: [
    task("背 30 个英语单词"),
    task("完成数学集合练习"),
    task("整理 1 道物理错题"),
    task("阅读 20 分钟"),
  ],
  knowledgeFavorites: [],
  masteredKnowledge: [],
  learningKnowledge: [],
  notes: {},
  videos: [
    { id: "v1", title: "高中物理 · 位移与路程", bv: "BV1xxxxxx", topic: "位移", status: "未观看", favorite: false },
    { id: "v2", title: "高中物理 · 速度与加速度", bv: "BV2xxxxxx", topic: "速度 / 加速度", status: "学习中", favorite: false },
    { id: "v3", title: "高中物理 · 牛顿第二定律", bv: "BV3xxxxxx", topic: "牛顿第二定律", status: "未观看", favorite: false },
  ],
  mistakes: [],
  materials: [
    material("m1", "成长", "成长不是突然发生的", "真正的成长，常常藏在一次次无人看见的坚持里。", false, false),
    material("m2", "坚持", "慢慢来也是一种抵达", "只要方向清楚，慢一点并不等于停下。", false, false),
    material("m3", "责任", "把自己的那一份做好", "责任感不是宏大的口号，而是愿意把眼前的小事做到可靠。", false, false),
  ],
  lastCheckIn: "",
  streak: 0,
};

let state = loadState();

function point(id, name, category, difficulty, summary, definition, formula, mistake, example) {
  return { id, name, category, difficulty, summary, definition, formula, mistake, example };
}

function normalizeChapter(chapter) {
  return String(chapter || "").replace(/^第[一二三四五六七八九十]+章：?/, "") || "运动的描述";
}

function displaySummary(text) {
  const clean = String(text || "").trim();
  return clean.length > 68 ? `${clean.slice(0, 68)}...` : clean;
}

function splitFormulas(formula) {
  const clean = String(formula || "").trim();
  if (!clean) return [];
  return clean.split(/[；;，,、]/).map((entry) => entry.trim()).filter(Boolean);
}

function detailAlias(id) {
  return {
    motion_particle: "particle",
    motion_reference_frame: "reference",
    motion_time_moment: "time-moment",
    motion_displacement: "displacement",
    motion_path_length: "displacement",
    motion_average_velocity: "velocity",
    motion_instant_velocity: "avg-instant-velocity",
    motion_acceleration: "acceleration",
    motion_uniformly_accelerated: "uniform",
    motion_velocity_formula: "velocity",
    motion_displacement_formula: "uniform",
    motion_free_fall: "freefall",
    motion_vertical_throw: "freefall",
    force_gravity: "gravity",
    force_elastic: "elastic",
    force_friction: "friction",
    force_composition_decomposition: "force-composition",
    newton_first_law: "newton1",
    newton_second_law: "newton2",
    newton_third_law: "newton3",
    newton_inertia: "newton1",
    newton_laws_application: "newton2",
  }[id] || id;
}

function normalizePhysicsPoint(raw) {
  const formulas = splitFormulas(raw.formula).map((formula) => ({
    formula,
    explain: raw.symbols || "先理解每个物理量的含义和单位，再代入公式。",
  }));
  return {
    id: raw.id,
    name: raw.name,
    category: normalizeChapter(raw.chapter),
    chapter: raw.chapter,
    difficulty: raw.difficulty || "⭐",
    summary: displaySummary(raw.definition),
    definition: raw.definition,
    formula: raw.formula,
    formulas,
    symbols: raw.symbols,
    mistakes: raw.mistakes || [],
    example: raw.example,
    hint: raw.hint,
    status: raw.status || "unlearned",
    video: raw.video || "",
    related: raw.related || [],
    detailId: detailAlias(raw.id),
  };
}

function getKnowledgeTier(item) {
  if (item.category === "实验专区") return "tool";
  const stars = String(item.difficulty || "").match(/⭐/g)?.length || 1;
  if (stars >= 4 || /牛顿第二定律|力的合成|匀变速|摩擦力|应用/.test(item.name)) return "primary";
  if (stars <= 1 || /质点|参考系|时间|路程/.test(item.name)) return "secondary";
  return "standard";
}

function getKnowledgeStatus(id) {
  if (state.masteredKnowledge.includes(id)) return { text: "已掌握", className: "mastered" };
  if (state.learningKnowledge?.includes(id) || state.notes[id]) return { text: "学习中", className: "learning" };
  return { text: "未学", className: "unlearned" };
}

function getKnowledgeKeyword(item) {
  return (physicsTags[item.id] || physicsTags[item.detailId] || [item.name, item.category]).slice(0, 2).join(" · ");
}

function getRelatedNames(item) {
  return (item.related || [])
    .map((id) => knowledgePoints.find((pointItem) => pointItem.id === id)?.name)
    .filter(Boolean)
    .slice(0, 2);
}

async function loadPhysicsData() {
  physicsDataStatus = { loading: true, error: "" };
  try {
    let response = await fetch("./data/physics.json", { cache: "no-store" });
    if (!response.ok) {
      response = await fetch("/data/physics.json", { cache: "no-store" });
    }
    if (!response.ok) throw new Error("physics.json 加载失败");
    const physicsData = await response.json();
    knowledgePoints = physicsData.map(normalizePhysicsPoint);
    physicsDataStatus = { loading: false, error: "" };
  } catch (error) {
    physicsDataStatus = {
      loading: false,
      error: "数据加载失败，请检查本地服务器是否启动",
    };
    console.warn("使用内置物理知识点备用数据：", error);
  }
}

function task(text) {
  return { id: `t${Date.now()}${Math.random()}`, text, done: false, createdAt: todayKey() };
}

function material(id, theme, title, content, favorite, custom) {
  return { id, theme, title, content, favorite, custom };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(saved) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState(message) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (message) showToast(message);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1700);
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function extractBV(input) {
  const match = input.trim().match(/BV[0-9A-Za-z]+/);
  return match ? match[0] : "";
}

function applyTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.classList.toggle("dark", savedTheme === "dark" || (!savedTheme && prefersDark));
}

function setPage(page) {
  state.activePage = page;
  state.search = "";
  globalSearch.value = "";
  $$(".page-view").forEach((view) => view.classList.toggle("active", view.dataset.pageView === page));
  $$(".nav-trigger").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function filteredTextMatch(values) {
  const keyword = state.search.trim().toLowerCase();
  return !keyword || values.join(" ").toLowerCase().includes(keyword);
}

function render() {
  renderFormOptions();
  renderToday();
  renderHome();
  renderLibrary();
  renderMistakes();
  renderMaterials();
  renderStats();
}

function renderFormOptions() {
  $("#mistakeTopic").innerHTML = knowledgePoints.map((item) => `<option value="${item.name}">${item.name}</option>`).join("");
}

function renderToday() {
  $("#todayLabel").textContent = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

function renderHome() {
  const todayTasks = state.tasks.filter((item) => item.createdAt === todayKey());
  const doneCount = todayTasks.filter((item) => item.done).length;
  $("#taskProgress").textContent = `${doneCount}/${todayTasks.length}`;
  $("#taskList").innerHTML = todayTasks.length ? todayTasks.map((item) => `
    <div class="task-row ${item.done ? "done" : ""}">
      <button class="task-check" type="button" data-toggle-task="${item.id}" aria-label="完成任务"></button>
      <span class="task-text">${escapeHTML(item.text)}</span>
      <button class="mini-button danger-button" type="button" data-delete-task="${item.id}">删除</button>
    </div>
  `).join("") : `<div class="empty-state">今天还没有任务，添加一个轻一点的开始。</div>`;

  const metrics = getMetrics();
  $("#homeMetrics").innerHTML = [
    ["今日完成", `${metrics.doneTasks} 项`],
    ["掌握知识点", `${metrics.mastered} 个`],
    ["已观看视频", `${metrics.watchedVideos} 个`],
    ["连续打卡", `${metrics.streak} 天`],
  ].map(([label, value]) => `<div class="metric-card"><span class="muted">${label}</span><strong>${value}</strong></div>`).join("");
}

function renderLibrary() {
  $("#categoryList").innerHTML = physicsCategories.map((category) => {
    const count = category === "视频课程" ? state.videos.length : knowledgePoints.filter((item) => item.category === category).length;
    return `<button class="category-button ${state.activeCategory === category ? "active" : ""}" type="button" data-category="${category}">
      <span class="category-label">${categoryIcons[category]}<span>${category}</span></span><small>${count}</small>
    </button>`;
  }).join("");

  const isVideo = state.activeCategory === "视频课程";
  $("#videoSection").hidden = !isVideo;
  $("#knowledgeGrid").hidden = isVideo;
  $("#libraryEyebrow").textContent = state.activeCategory;
  $("#libraryTitle").textContent = isVideo ? "视频课程" : "知识点";

  if (isVideo) {
    $("#libraryCount").textContent = `${state.videos.length} 个视频`;
    renderVideos();
    return;
  }

  if (physicsDataStatus.loading) {
    $("#libraryCount").textContent = "加载中";
    $("#knowledgeGrid").innerHTML = `<div class="library-notice loading-notice">正在加载物理知识库数据...</div>`;
    return;
  }

  const points = knowledgePoints.filter((item) => item.category === state.activeCategory && filteredTextMatch([item.name, item.summary, item.category]));
  $("#libraryCount").textContent = `${points.length} 个知识点`;
  const errorNotice = physicsDataStatus.error ? `<div class="library-notice error-notice">${physicsDataStatus.error}</div>` : "";
  $("#knowledgeGrid").innerHTML = points.length ? errorNotice + points.map((item) => {
    const favorite = state.knowledgeFavorites.includes(item.id);
    const mastered = state.masteredKnowledge.includes(item.id);
    const status = getKnowledgeStatus(item.id);
    const tier = getKnowledgeTier(item);
    const relatedNames = getRelatedNames(item);
    return `<article class="knowledge-card knowledge-card-${tier} fade-slide">
      <div class="knowledge-title-layer">
        <div>
          <span class="knowledge-kicker">${escapeHTML(getKnowledgeKeyword(item))}</span>
          <h3>${escapeHTML(item.name)}</h3>
        </div>
        <button class="mini-button ${favorite ? "active" : ""}" type="button" data-favorite-knowledge="${item.id}">${favorite ? "已收藏" : "收藏"}</button>
      </div>
      <p class="knowledge-definition">${escapeHTML(item.summary)}</p>
      <div class="knowledge-meta-layer">
        <span class="status knowledge-status ${status.className}">${status.text}</span>
        <span class="physics-chip">易错 ${item.mistakes?.length || 1}</span>
        ${relatedNames.length ? `<span class="physics-chip">关联 ${relatedNames.map(escapeHTML).join(" / ")}</span>` : ""}
        <span class="tag">${escapeHTML(item.difficulty)}</span>
      </div>
      <div class="card-actions">
        <button class="mini-button detail-button" type="button" data-open-detail="${item.id}">进入详情</button>
        <button class="mini-button ${mastered ? "active" : ""}" type="button" data-master-knowledge="${item.id}">${mastered ? "取消掌握" : "标记已掌握"}</button>
      </div>
    </article>`;
  }).join("") : errorNotice + `<div class="empty-state">没有找到匹配的知识点。</div>`;
}

function renderVideos() {
  const videos = state.videos.filter((video) => filteredTextMatch([video.title, video.bv, video.topic, video.status]));
  $("#videoGrid").innerHTML = videos.length ? videos.map((video) => `
    <article class="video-card fade-slide">
      <div class="card-top">
        <h3>${escapeHTML(video.title)}</h3>
        <button class="mini-button ${video.favorite ? "active" : ""}" type="button" data-favorite-video="${video.id}">${video.favorite ? "已收藏" : "收藏"}</button>
      </div>
      <div class="video-meta">
        <span>BV号：${escapeHTML(video.bv)}</span>
        <span class="physics-chip">知识点：${escapeHTML(video.topic)}</span>
        <span class="status ${video.status === "已观看" ? "watched" : ""}">状态：${escapeHTML(video.status)}</span>
      </div>
      <div class="video-progress" aria-label="观看进度"><span style="width:${video.status === "已观看" ? 100 : video.status === "学习中" ? 48 : 8}%"></span></div>
      <div class="related-formula"><strong>关联公式</strong>${renderVideoFormulas(video.topic)}</div>
      <div class="video-actions">
        <button class="mini-button play-button" type="button" data-play-video="${video.id}"><span class="play-dot">▶</span>播放</button>
        <button class="mini-button ${video.status === "已观看" ? "active" : ""}" type="button" data-watch-video="${video.id}">${video.status === "已观看" ? "已观看" : "标记已观看"}</button>
        <button class="mini-button danger-button" type="button" data-delete-video="${video.id}">删除</button>
      </div>
    </article>
  `).join("") : `<div class="empty-state">还没有匹配的视频。</div>`;
}

function renderPhysicsTags(id) {
  const pointItem = knowledgePoints.find((item) => item.id === id);
  const tags = physicsTags[id] || physicsTags[pointItem?.detailId] || [pointItem?.difficulty || "Physics"];
  return tags.map((tag) => `<span>${tag}</span>`).join("");
}

function renderVideoFormulas(topic) {
  const matched = knowledgePoints.filter((item) => topic.includes(item.name) || item.name.includes(topic));
  const formulas = matched.flatMap((item) => item.formulas?.length ? item.formulas : formulaDetails[item.detailId || item.id] || [{ formula: item.formula, explain: "" }]).slice(0, 2);
  if (!formulas.length) return `<span>${escapeHTML(topic)}</span>`;
  return formulas.map((item) => `<span>${escapeHTML(item.formula)}</span>`).join("");
}

function renderMistakes() {
  const mistakes = state.mistakes.filter((item) => filteredTextMatch([item.question, item.subject, item.topic, item.reason, item.solution]));
  $("#mistakeCount").textContent = `${mistakes.length} 题`;
  $("#mistakeList").innerHTML = mistakes.length ? mistakes.map((item) => `
    <article class="item-card fade-slide">
      <div class="card-top">
        <h3>${escapeHTML(item.subject)} · ${escapeHTML(item.topic)}</h3>
        <span class="status ${item.mastered ? "mastered" : ""}">${item.mastered ? "已掌握" : "待复习"}</span>
      </div>
      <p>${escapeHTML(item.question)}</p>
      <p><strong>错因：</strong>${escapeHTML(item.reason)}</p>
      <p><strong>正确思路：</strong>${escapeHTML(item.solution)}</p>
      ${item.image ? `<img class="mistake-image" src="${item.image}" alt="错题图片" />` : ""}
      <div class="card-actions">
        <button class="mini-button ${item.mastered ? "active" : ""}" type="button" data-master-mistake="${item.id}">${item.mastered ? "取消掌握" : "标记已掌握"}</button>
        <button class="mini-button danger-button" type="button" data-delete-mistake="${item.id}">删除</button>
      </div>
    </article>
  `).join("") : `<div class="empty-state">还没有错题。把第一道真正值得复盘的题放进来。</div>`;
}

function renderMaterials() {
  $("#materialThemes").innerHTML = materialThemes.map((theme) => {
    const count = state.materials.filter((item) => item.theme === theme).length;
    return `<button class="category-button ${state.activeTheme === theme ? "active" : ""}" type="button" data-theme="${theme}">
      <span>${theme}</span><small>${count}</small>
    </button>`;
  }).join("");
  $("#materialThemeInput").innerHTML = materialThemes.map((theme) => `<option value="${theme}">${theme}</option>`).join("");
  $("#materialEyebrow").textContent = state.activeTheme;

  const materials = state.materials.filter((item) => item.theme === state.activeTheme && filteredTextMatch([item.title, item.content, item.theme]));
  $("#materialCount").textContent = `${materials.length} 条`;
  $("#materialGrid").innerHTML = materials.length ? materials.map((item) => `
    <article class="item-card fade-slide">
      <div class="card-top">
        <h3>${escapeHTML(item.title)}</h3>
        <button class="mini-button ${item.favorite ? "active" : ""}" type="button" data-favorite-material="${item.id}">${item.favorite ? "已收藏" : "收藏"}</button>
      </div>
      <p>${escapeHTML(item.content)}</p>
      <div class="tag-row">
        <span class="tag">${escapeHTML(item.theme)}</span>
        ${item.custom ? `<span class="tag">我的素材</span>` : `<span class="tag">预置素材</span>`}
      </div>
      <div class="card-actions">
        ${item.custom ? `<button class="mini-button danger-button" type="button" data-delete-material="${item.id}">删除</button>` : ""}
      </div>
    </article>
  `).join("") : `<div class="empty-state">这个主题还没有匹配素材。</div>`;
}

function getMetrics() {
  const today = todayKey();
  return {
    doneTasks: state.tasks.filter((item) => item.createdAt === today && item.done).length,
    mastered: state.masteredKnowledge.length,
    watchedVideos: state.videos.filter((item) => item.status === "已观看").length,
    mistakes: state.mistakes.length,
    streak: state.streak || 0,
  };
}

function renderStats() {
  const metrics = getMetrics();
  const stats = [
    ["今日完成任务数", metrics.doneTasks],
    ["已掌握知识点", metrics.mastered],
    ["已观看视频", metrics.watchedVideos],
    ["错题总数", metrics.mistakes],
    ["连续打卡天数", metrics.streak],
  ];
  $("#statsGrid").innerHTML = stats.map(([label, value]) => `<div class="stat-card"><span class="muted">${label}</span><strong>${value}</strong></div>`).join("");
  $("#progressBoard").innerHTML = [
    ["知识掌握", metrics.mastered, knowledgePoints.length],
    ["视频观看", metrics.watchedVideos, Math.max(state.videos.length, 1)],
    ["今日任务", metrics.doneTasks, Math.max(state.tasks.filter((item) => item.createdAt === todayKey()).length, 1)],
  ].map(([label, value, total]) => {
    const percent = Math.min(100, Math.round((value / total) * 100));
    return `<div class="progress-card">
      <label><span>${label}</span><span>${percent}%</span></label>
      <div class="progress-track"><div class="progress-value" style="width:${percent}%"></div></div>
    </div>`;
  }).join("");
}

function updateStreak() {
  const today = todayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (state.lastCheckIn === today) return;
  state.streak = state.lastCheckIn === yesterday ? (state.streak || 0) + 1 : 1;
  state.lastCheckIn = today;
  saveState();
}

function openDetail(id) {
  const item = knowledgePoints.find((pointItem) => pointItem.id === id);
  if (!item) return;
  if (!state.masteredKnowledge.includes(id) && !state.learningKnowledge?.includes(id)) {
    state.learningKnowledge = [...(state.learningKnowledge || []), id];
    saveState();
  }
  const detailId = item.detailId || item.id;
  const status = getKnowledgeStatus(item.id);
  const richDetail = item.symbols ? {
    definition: item.definition,
    formulas: item.formulas,
    quantities: item.symbols,
    mistakes: item.mistakes,
    example: item.example,
    tip: item.hint,
  } : richPointDetails[detailId];
  const relatedVideos = state.videos.filter((video) => video.topic.includes(item.name) || item.name.includes(video.topic));
  $("#detailContent").innerHTML = `
    <div class="detail-title-row">
      <div>
        <p class="eyebrow">${escapeHTML(item.category)} · ${escapeHTML(getKnowledgeKeyword(item))}</p>
        <h2>${escapeHTML(item.name)}</h2>
      </div>
      <span class="status knowledge-status ${status.className}">${status.text}</span>
    </div>
    <div class="detail-grid">
      ${detailBlock("一、核心定义", richDetail?.definition || item.definition, "definition-module")}
      ${formulaBlock(item)}
      ${richDetail ? detailBlock("三、物理量说明", richDetail.quantities, "full quantity-module") : ""}
      <section class="detail-block diagram-block">
        <h3>微型示意图</h3>
        ${renderDiagram(detailId)}
      </section>
      ${mistakeBlock(richDetail?.mistakes || item.mistakes || [item.mistake])}
      ${workedExampleBlock(detailId, richDetail?.example || item.example)}
      ${richDetail ? detailBlock("六、学习提示", richDetail.tip, "full tip-block") : ""}
      ${miniLabBlock(item)}
      <section class="detail-block full video-module">
        <h3>七、关联视频</h3>
        <div class="related-videos">
          ${relatedVideos.length ? relatedVideos.map((video) => `<div class="related-video">
            <span>${escapeHTML(video.title)} · ${escapeHTML(video.bv)}</span>
            <button class="mini-button" type="button" data-play-video="${video.id}">播放</button>
          </div>`).join("") : `<p>暂无视频，可添加 B站链接。</p>`}
        </div>
      </section>
      <section class="detail-block full note-module">
        <h3>八、我的笔记</h3>
        <textarea id="noteInput" placeholder="写下你自己的理解、错因或课堂补充。">${escapeHTML(state.notes[item.id] || "")}</textarea>
        <div class="card-actions">
          <button class="primary-button" type="button" data-save-note="${item.id}">保存笔记</button>
        </div>
      </section>
    </div>`;
  openModal("#detailModal");
}

function detailBlock(title, content, extraClass = "") {
  return `<section class="detail-block ${extraClass}"><h3>${title}</h3><p>${content}</p></section>`;
}

function exampleBlock(examples) {
  return `<section class="detail-block full life-example-block">
    <h3>生活中的例子</h3>
    <ul>${examples.map((example) => `<li>${example}</li>`).join("")}</ul>
  </section>`;
}

function mistakeBlock(mistakes) {
  return `<section class="detail-block full mistake-block">
    <h3>四、易错点</h3>
    <ul>${mistakes.map((mistake) => `<li>${mistake}</li>`).join("")}</ul>
  </section>`;
}

function workedExampleBlock(id, example) {
  if (example && !workedExamples[id]) {
    return `<section class="detail-block full worked-example-block">
      <h3>五、典型例题</h3>
      <p class="example-question">${escapeHTML(example)}</p>
    </section>`;
  }
  const [question, solution] = workedExamples[id] || [example, "先明确物理量，再代入对应公式。"];
  return `<section class="detail-block full worked-example-block">
    <h3>五、典型例题</h3>
    <p class="example-question">题目：${question}</p>
    <p class="example-solution">解析：${solution}</p>
  </section>`;
}

function formulaBlock(item) {
  const detailId = item.detailId || item.id;
  const formulas = item.formulas?.length
    ? item.formulas
    : richPointDetails[detailId]?.formulas?.length
      ? richPointDetails[detailId].formulas
      : formulaDetails[detailId] || [{ formula: item.formula || "无固定公式", explain: item.symbols || "先理解物理量含义，再代入带单位的数据。" }];
  return `<section class="detail-block formula-block">
    <h3>二、核心公式</h3>
    ${formulas.map((entry) => `<button class="formula-card" type="button" data-highlight-formula>
      <strong>${escapeHTML(entry.formula)}</strong>
      <span>${escapeHTML(entry.explain)}</span>
    </button>`).join("")}
  </section>`;
}

function renderDiagram(id) {
  const diagrams = {
    particle: `<svg class="mini-diagram motion-diagram particle-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path class="trace" d="M38 118 C82 36 150 40 218 102"/><circle class="moving-dot" cx="38" cy="118" r="7"/><text x="110" y="82">质点模型</text></svg>`,
    reference: `<svg class="mini-diagram motion-diagram reference-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path d="M38 118H220"/><rect class="moving-box" x="84" y="88" width="58" height="30" rx="6"/><path class="accent-line" d="M154 102h54" marker-end="url(#miniArrow)"/><text x="72" y="136">地面参考系</text><text x="156" y="92">相对运动</text></svg>`,
    "time-moment": `<svg class="mini-diagram motion-diagram timeline-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path d="M38 92H222" marker-end="url(#miniArrow)"/><circle class="pulse-dot dot-a" cx="78" cy="92" r="6"/><circle class="pulse-dot dot-b" cx="174" cy="92" r="6"/><path class="accent-line span-line" d="M78 70H174"/><text x="66" y="118">t₁</text><text x="162" y="118">t₂</text><text x="104" y="60">Δt</text></svg>`,
    displacement: `<svg class="mini-diagram motion-diagram displacement-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path class="route-line" d="M44 118 C90 64 124 136 168 70 S206 92 226 52"/><circle cx="54" cy="108" r="8"/><circle cx="206" cy="62" r="8"/><path class="accent-line displacement-arrow" d="M54 108 206 62" marker-end="url(#miniArrow)"/><text x="44" y="132">A</text><text x="214" y="58">B</text></svg>`,
    velocity: `<svg class="mini-diagram motion-diagram velocity-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path d="M34 108H220"/><circle class="moving-dot" cx="72" cy="108" r="12"/><path class="accent-line speed-arrow" d="M94 108H184" marker-end="url(#miniArrow)"/><text x="122" y="88">v</text></svg>`,
    "avg-instant-velocity": `<svg class="mini-diagram motion-diagram instant-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path class="trace" d="M42 118 C88 58 150 48 218 88"/><circle class="moving-dot" cx="120" cy="70" r="8"/><path class="accent-line tangent-arrow" d="M118 70h62" marker-end="url(#miniArrow)"/><path class="average-line" d="M42 118 218 88" marker-end="url(#miniArrow)"/><text x="146" y="60">瞬时</text><text x="88" y="132">平均</text></svg>`,
    acceleration: `<svg class="mini-diagram motion-diagram acceleration-diagram" viewBox="0 0 260 170"><defs>${svgArrow()}</defs><path class="track-line" d="M34 122H226"/><g class="accel-frame frame-one"><circle cx="50" cy="122" r="8"/><path class="velocity-vector v-one" d="M62 122h26" marker-end="url(#miniArrow)"/><text x="58" y="145">v₁</text></g><g class="accel-frame frame-two"><circle cx="112" cy="122" r="9"/><path class="velocity-vector v-two" d="M126 122h46" marker-end="url(#miniArrow)"/><text x="124" y="145">v₂</text></g><g class="accel-frame frame-three"><circle cx="184" cy="122" r="10"/><path class="velocity-vector v-three" d="M199 122h62" marker-end="url(#miniArrow)"/><text x="204" y="145">v₃</text></g><path class="delta-v" d="M82 66h100" marker-end="url(#miniArrow)"/><text x="110" y="55">Δv</text><text x="92" y="84">a = Δv / Δt</text></svg>`,
    uniform: `<svg class="mini-diagram motion-diagram uniform-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path class="slope" d="M42 126 214 62"/><circle class="moving-dot" cx="72" cy="115" r="9"/><path class="accent-line" d="M98 106l64-24" marker-end="url(#miniArrow)"/><text x="154" y="74">a 恒定</text></svg>`,
    freefall: `<svg class="mini-diagram freefall-diagram" viewBox="0 0 260 180"><defs>${svgArrow()}</defs><path class="fall-guide" d="M126 30V146"/><path class="fall-ground" d="M58 150H204"/><circle class="fall-start" cx="126" cy="30" r="5"/><circle class="fall-shadow" cx="126" cy="151" r="18"/><circle class="fall-ball" cx="126" cy="42" r="11"/><path class="gravity-arrow" d="M174 40v66" marker-end="url(#miniArrow)"/><path class="velocity-arrow" d="M126 72v44" marker-end="url(#miniArrow)"/><text x="184" y="78">g</text><text x="138" y="108">v</text><text x="80" y="28">释放</text><text x="74" y="168">速度逐渐增大</text></svg>`,
    force: `<svg class="mini-diagram motion-diagram force-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><g class="object-with-arrows"><rect class="force-block" x="96" y="72" width="56" height="42" rx="8"/><path class="accent-line force-arrow" d="M152 93h58" marker-end="url(#miniArrow)"/><text x="178" y="84">F</text></g><path d="M44 124H216"/></svg>`,
    gravity: `<svg class="mini-diagram motion-diagram gravity-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><circle class="gravity-ball" cx="128" cy="54" r="14"/><path class="accent-line gravity-pull" d="M128 80v62" marker-end="url(#miniArrow)"/><path d="M70 144H190"/><text x="144" y="118">G = mg</text></svg>`,
    elastic: `<svg class="mini-diagram motion-diagram elastic-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path d="M38 84h34"/><path class="spring-line" d="M72 84 l10-18 l10 36 l10-36 l10 36 l10-36 l10 36 l10-18 h46"/><rect class="force-block" x="188" y="66" width="36" height="36" rx="6"/><path class="accent-line spring-arrow" d="M188 84h-44" marker-end="url(#miniArrow)"/><text x="114" y="122">F = kx</text></svg>`,
    friction: `<svg class="mini-diagram motion-diagram friction-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path d="M38 118H222"/><g class="sliding-block"><rect class="force-block" x="102" y="78" width="56" height="40" rx="8"/><path class="accent-line" d="M158 98h50" marker-end="url(#miniArrow)"/><path class="friction-arrow" d="M102 98H58" marker-end="url(#miniArrow)"/><text x="178" y="88">v</text><text x="66" y="88">f</text></g></svg>`,
    "force-composition": `<svg class="mini-diagram motion-diagram composition-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><circle cx="86" cy="112" r="5"/><path class="accent-line diag-force" d="M86 112 174 48" marker-end="url(#miniArrow)"/><path class="component-x" d="M86 112h92" marker-end="url(#miniArrow)"/><path class="component-y" d="M178 112V50" marker-end="url(#miniArrow)"/><text x="132" y="128">Fx</text><text x="186" y="82">Fy</text><text x="132" y="58">F</text></svg>`,
    newton1: `<svg class="mini-diagram motion-diagram inertia-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path d="M36 112H224"/><circle class="moving-dot steady" cx="70" cy="112" r="11"/><path class="accent-line" d="M92 112h92" marker-end="url(#miniArrow)"/><text x="104" y="90">ΣF = 0</text><text x="96" y="136">速度保持</text></svg>`,
    newton2: `<svg class="mini-diagram motion-diagram newton2-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path class="track-line" d="M42 126H222"/><g class="rolling-cart"><rect class="force-block" x="70" y="82" width="78" height="36" rx="8"/><circle class="wheel" cx="92" cy="122" r="8"/><circle class="wheel" cx="126" cy="122" r="8"/><path class="accent-line force-arrow" d="M148 100h54" marker-end="url(#miniArrow)"/><path class="acc-arrow" d="M86 62h76" marker-end="url(#miniArrow)"/><text x="174" y="92">F</text><text x="118" y="54">a</text></g><text x="86" y="148">F = ma</text></svg>`,
    newton3: `<svg class="mini-diagram motion-diagram newton3-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><rect class="force-block" x="72" y="78" width="44" height="38" rx="8"/><rect class="force-block" x="144" y="78" width="44" height="38" rx="8"/><path class="pair-a" d="M116 96h50" marker-end="url(#miniArrow)"/><path class="pair-b" d="M144 104H94" marker-end="url(#miniArrow)"/><text x="80" y="64">A</text><text x="172" y="64">B</text><text x="82" y="136">等大反向</text></svg>`,
    ticker: `<svg class="mini-diagram motion-diagram ticker-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path d="M34 106H226"/><circle class="paper-dot d1" cx="58" cy="106" r="4"/><circle class="paper-dot d2" cx="86" cy="106" r="4"/><circle class="paper-dot d3" cx="124" cy="106" r="4"/><circle class="paper-dot d4" cx="176" cy="106" r="4"/><path class="accent-line" d="M58 78h118" marker-end="url(#miniArrow)"/><text x="74" y="66">点距增大</text></svg>`,
    "newton-lab": `<svg class="mini-diagram motion-diagram lab-diagram" viewBox="0 0 260 160"><defs>${svgArrow()}</defs><path class="track-line" d="M42 130H154"/><g class="rolling-cart lab-cart"><rect class="force-block" x="66" y="92" width="68" height="34" rx="8"/><circle class="wheel" cx="84" cy="130" r="7"/><circle class="wheel" cx="116" cy="130" r="7"/><path class="accent-line force-arrow" d="M134 108h42" marker-end="url(#miniArrow)"/><text x="80" y="82">小车</text></g><path class="pulley-line" d="M176 108h22v28"/><circle class="hanging-mass" cx="198" cy="138" r="10"/><text x="174" y="124">钩码</text></svg>`,
  };
  return diagrams[id] || diagrams.force;
}

function svgArrow() {
  return `<marker id="miniArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 10 5 0 10z"/></marker>`;
}

function miniLabBlock(item) {
  const labId = item.detailId || item.id;
  const labs = {
    displacement: `<div class="mini-lab" data-lab="displacement">
      <div class="lab-canvas" id="displacementLab"><button style="left:24%;top:58%" data-point="a">A</button><button style="left:72%;top:34%" data-point="b">B</button><svg viewBox="0 0 100 100"><defs>${svgArrow()}</defs><path id="displacementLine" d="M24 58 L72 34" marker-end="url(#miniArrow)"/></svg></div>
      <p class="lab-result" id="displacementResult">位移大小约 54.0 单位</p>
    </div>`,
    velocity: labInputs("velocity", [["位移 Δx", "dx", 20], ["时间 Δt", "dt", 4]], "平均速度 v = 5.00 m/s"),
    acceleration: labInputs("acceleration", [["初速度 v₀", "v0", 2], ["末速度 v", "v1", 10], ["时间 Δt", "dt", 4]], "加速度 a = 2.00 m/s²"),
    newton2: labInputs("newton2", [["质量 m", "m", 2], ["加速度 a", "a", 3]], "合外力 F = 6.00 N"),
  };
  const lab = labs[labId];
  if (!lab) return "";
  return `<section class="detail-block full"><h3>Physics Mini Lab</h3>${lab}</section>`;
}

function labInputs(type, fields, result) {
  return `<div class="mini-lab" data-lab="${type}">
    <div class="lab-inputs">${fields.map(([label, key, value]) => `<label>${label}<input type="number" step="0.1" value="${value}" data-lab-input="${key}"></label>`).join("")}</div>
    <p class="lab-result">${result}</p>
  </div>`;
}

function openPlayer(videoId) {
  const video = state.videos.find((item) => item.id === videoId);
  if (!video) return;
  $("#playerTitle").textContent = video.title;
  $("#playerFrame").innerHTML = `<iframe src="https://player.bilibili.com/player.html?bvid=${encodeURIComponent(video.bv)}" allowfullscreen="allowfullscreen" scrolling="no" title="${escapeHTML(video.title)}"></iframe>`;
  openModal("#playerModal");
}

function openModal(selector) {
  $(selector).classList.add("open");
  $(selector).setAttribute("aria-hidden", "false");
}

function closeModal(selector) {
  $(selector).classList.remove("open");
  $(selector).setAttribute("aria-hidden", "true");
  if (selector === "#playerModal") $("#playerFrame").innerHTML = "";
}

function confirmDelete(message) {
  return window.confirm(message);
}

async function initApp() {
  applyTheme();
  updateStreak();
  setPage(initialPage);
  await loadPhysicsData();
  render();
  setPage(initialPage);
}

initApp();

$("#themeToggle").addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, root.classList.contains("dark") ? "dark" : "light");
  showToast(root.classList.contains("dark") ? "已切换为深色模式" : "已切换为浅色模式");
});

$("#avatarButton").addEventListener("click", () => {
  showToast("个人中心会在后续版本继续扩展");
});

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-page]");
  if (nav) setPage(nav.dataset.page);

  const category = event.target.closest("[data-category]");
  if (category) {
    state.activeCategory = category.dataset.category;
    saveState();
    renderLibrary();
  }

  const theme = event.target.closest("[data-theme]");
  if (theme) {
    state.activeTheme = theme.dataset.theme;
    saveState();
    renderMaterials();
  }

  const taskToggle = event.target.closest("[data-toggle-task]");
  if (taskToggle) {
    const item = state.tasks.find((taskItem) => taskItem.id === taskToggle.dataset.toggleTask);
    if (item) item.done = !item.done;
    saveState("任务状态已保存");
    render();
  }

  const taskDelete = event.target.closest("[data-delete-task]");
  if (taskDelete && confirmDelete("确定删除这个任务吗？")) {
    state.tasks = state.tasks.filter((item) => item.id !== taskDelete.dataset.deleteTask);
    saveState("任务已删除");
    render();
  }

  const favKnowledge = event.target.closest("[data-favorite-knowledge]");
  if (favKnowledge) {
    const id = favKnowledge.dataset.favoriteKnowledge;
    state.knowledgeFavorites = state.knowledgeFavorites.includes(id) ? state.knowledgeFavorites.filter((item) => item !== id) : [...state.knowledgeFavorites, id];
    saveState("收藏状态已保存");
    renderLibrary();
  }

  const masterKnowledge = event.target.closest("[data-master-knowledge]");
  if (masterKnowledge) {
    const id = masterKnowledge.dataset.masterKnowledge;
    state.masteredKnowledge = state.masteredKnowledge.includes(id) ? state.masteredKnowledge.filter((item) => item !== id) : [...state.masteredKnowledge, id];
    if (state.masteredKnowledge.includes(id)) {
      state.learningKnowledge = (state.learningKnowledge || []).filter((item) => item !== id);
    }
    saveState("知识点状态已保存");
    render();
  }

  const detail = event.target.closest("[data-open-detail]");
  if (detail) openDetail(detail.dataset.openDetail);

  const saveNote = event.target.closest("[data-save-note]");
  if (saveNote) {
    const id = saveNote.dataset.saveNote;
    state.notes[id] = $("#noteInput").value;
    if (!state.masteredKnowledge.includes(id) && !(state.learningKnowledge || []).includes(id)) {
      state.learningKnowledge = [...(state.learningKnowledge || []), id];
    }
    saveState("笔记已保存");
  }

  const formula = event.target.closest("[data-highlight-formula]");
  if (formula) {
    formula.classList.toggle("active");
  }

  const playVideo = event.target.closest("[data-play-video]");
  if (playVideo) openPlayer(playVideo.dataset.playVideo);

  const watchVideo = event.target.closest("[data-watch-video]");
  if (watchVideo) {
    const video = state.videos.find((item) => item.id === watchVideo.dataset.watchVideo);
    if (video) video.status = video.status === "已观看" ? "未观看" : "已观看";
    saveState("视频观看状态已保存");
    render();
  }

  const favVideo = event.target.closest("[data-favorite-video]");
  if (favVideo) {
    const video = state.videos.find((item) => item.id === favVideo.dataset.favoriteVideo);
    if (video) video.favorite = !video.favorite;
    saveState("视频收藏状态已保存");
    renderLibrary();
  }

  const deleteVideo = event.target.closest("[data-delete-video]");
  if (deleteVideo && confirmDelete("确定删除这个视频吗？")) {
    state.videos = state.videos.filter((item) => item.id !== deleteVideo.dataset.deleteVideo);
    saveState("视频已删除");
    render();
  }

  const masterMistake = event.target.closest("[data-master-mistake]");
  if (masterMistake) {
    const item = state.mistakes.find((mistake) => mistake.id === masterMistake.dataset.masterMistake);
    if (item) item.mastered = !item.mastered;
    saveState("错题状态已保存");
    render();
  }

  const deleteMistake = event.target.closest("[data-delete-mistake]");
  if (deleteMistake && confirmDelete("确定删除这道错题吗？")) {
    state.mistakes = state.mistakes.filter((item) => item.id !== deleteMistake.dataset.deleteMistake);
    saveState("错题已删除");
    render();
  }

  const favMaterial = event.target.closest("[data-favorite-material]");
  if (favMaterial) {
    const item = state.materials.find((materialItem) => materialItem.id === favMaterial.dataset.favoriteMaterial);
    if (item) item.favorite = !item.favorite;
    saveState("素材收藏状态已保存");
    renderMaterials();
  }

  const deleteMaterial = event.target.closest("[data-delete-material]");
  if (deleteMaterial && confirmDelete("确定删除这条自定义素材吗？")) {
    state.materials = state.materials.filter((item) => item.id !== deleteMaterial.dataset.deleteMaterial);
    saveState("素材已删除");
    renderMaterials();
  }

  if (event.target.closest("[data-close-detail]")) closeModal("#detailModal");
  if (event.target.closest("[data-close-player]")) closeModal("#playerModal");
});

globalSearch.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
});

$("#taskForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.tasks.unshift(task($("#taskInput").value.trim()));
  $("#taskForm").reset();
  saveState("任务已添加");
  render();
});

$("#videoForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const bv = extractBV($("#videoBvInput").value);
  if (!bv) {
    showToast("请输入有效的 BV 号");
    return;
  }
  state.videos.unshift({
    id: `v${Date.now()}`,
    title: $("#videoTitleInput").value.trim(),
    bv,
    topic: $("#videoTopicInput").value.trim(),
    status: "未观看",
    favorite: false,
  });
  $("#videoForm").reset();
  saveState("视频已添加");
  render();
});

let pendingMistakeImage = "";

$("#mistakeImage").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    pendingMistakeImage = reader.result;
    $("#mistakeImagePreview").innerHTML = `<img src="${pendingMistakeImage}" alt="错题图片预览" />`;
  };
  reader.readAsDataURL(file);
});

$("#mistakeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.mistakes.unshift({
    id: `e${Date.now()}`,
    question: $("#mistakeQuestion").value.trim(),
    subject: $("#mistakeSubject").value,
    topic: $("#mistakeTopic").value.trim(),
    reason: $("#mistakeReason").value.trim(),
    solution: $("#mistakeSolution").value.trim(),
    image: pendingMistakeImage,
    mastered: false,
    createdAt: todayKey(),
  });
  pendingMistakeImage = "";
  $("#mistakeImagePreview").textContent = "图片预览";
  $("#mistakeForm").reset();
  saveState("错题已保存");
  render();
});

$("#materialForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const theme = $("#materialThemeInput").value;
  state.activeTheme = theme;
  state.materials.unshift(material(
    `m${Date.now()}`,
    theme,
    $("#materialTitleInput").value.trim(),
    $("#materialContentInput").value.trim(),
    false,
    true,
  ));
  $("#materialForm").reset();
  saveState("素材已添加");
  renderMaterials();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeModal("#detailModal");
  closeModal("#playerModal");
});

document.addEventListener("input", (event) => {
  if (!event.target.closest(".mini-lab")) return;
  updateMiniLab(event.target.closest(".mini-lab"));
});

document.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest("[data-point]");
  if (!handle) return;
  const lab = $("#displacementLab");
  handle.setPointerCapture(event.pointerId);
  handle.addEventListener("pointermove", dragPoint);
  handle.addEventListener("pointerup", stopDrag, { once: true });

  function dragPoint(moveEvent) {
    const rect = lab.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((moveEvent.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(86, Math.max(12, ((moveEvent.clientY - rect.top) / rect.height) * 100));
    handle.style.left = `${x}%`;
    handle.style.top = `${y}%`;
    updateDisplacementLine();
  }

  function stopDrag() {
    handle.removeEventListener("pointermove", dragPoint);
  }
});

function updateMiniLab(lab) {
  const type = lab.dataset.lab;
  const value = (key) => Number(lab.querySelector(`[data-lab-input="${key}"]`)?.value || 0);
  const result = lab.querySelector(".lab-result");
  if (type === "velocity") result.textContent = `平均速度 v = ${(value("dx") / Math.max(value("dt"), 0.001)).toFixed(2)} m/s`;
  if (type === "acceleration") result.textContent = `加速度 a = ${((value("v1") - value("v0")) / Math.max(value("dt"), 0.001)).toFixed(2)} m/s²`;
  if (type === "newton2") result.textContent = `合外力 F = ${(value("m") * value("a")).toFixed(2)} N`;
}

function updateDisplacementLine() {
  const lab = $("#displacementLab");
  if (!lab) return;
  const a = lab.querySelector('[data-point="a"]');
  const b = lab.querySelector('[data-point="b"]');
  const ax = parseFloat(a.style.left);
  const ay = parseFloat(a.style.top);
  const bx = parseFloat(b.style.left);
  const by = parseFloat(b.style.top);
  $("#displacementLine").setAttribute("d", `M${ax} ${ay} L${bx} ${by}`);
  $("#displacementResult").textContent = `位移大小约 ${Math.hypot(bx - ax, by - ay).toFixed(1)} 单位`;
}
