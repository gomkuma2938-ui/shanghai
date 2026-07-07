function copy(text) { navigator.clipboard.writeText(text); alert("복사: " + text); }
function getCnSub(text) { const m = text.match(/\((.*?)\)/); return m ? m[1] : text; }
function formatSubway(text) {
    const lineMatch = text.match(/(\d+)호선/);
    if (!lineMatch) return text;
    const lineNum = lineMatch[1];
    const stationName = text.split(' ')[0];
    return `<div style="display: flex; align-items: center; gap: 5px;"><span class="subway-tag line-${lineNum}">${lineNum}</span><span>${stationName}</span></div>`;
}

// 위치 탭
function showLocationTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('menu-depth2').innerHTML = `<button onclick="renderLocation('hotel', this)">호텔</button><button onclick="renderLocation('tour', this)">관광지</button><button onclick="renderLocation('restaurant', this)">식당</button>`;
    renderLocation('hotel', document.querySelector('#menu-depth2 button'));
}
function renderLocation(cat, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const list = window[cat + 'Data'];
    document.getElementById('menu-depth3').innerHTML = list.map((i, idx) => `<button onclick="renderLocCard('${cat}', ${idx}, this)">${i.kr}</button>`).join('');
    renderLocCard(cat, 0, document.querySelector('#menu-depth3 button'));
}
function renderLocCard(cat, idx, btn) {
    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    const item = window[cat + 'Data'][idx];
    document.getElementById('app').innerHTML = `<div class="card" onclick="copy('${item.cn}')"><div><div class="kr-med">${item.kr}</div><div class="cn-big">${item.cn}</div><div class="label" style="font-size:12px; color:#999; margin-top:5px;">주소: ${item.addr}</div><div class="label" style="font-size:12px; color:#999; margin-top:5px;">지하철: ${formatSubway(item.sub)}</div></div></div>`;
}

// 메뉴 탭
const resName = { jiajia: "지아지아탕바오", dahuchun: "다후춘" };
function showMenuTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('menu-depth2').innerHTML = Object.keys(menuData).map(res => `<button onclick="loadMenu('${res}', this)">${resName[res]}</button>`).join('');
    loadMenu(Object.keys(menuData)[0], document.querySelector('#menu-depth2 button'));
}
function loadMenu(res, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cats = Object.keys(menuData[res]);
    document.getElementById('menu-depth3').innerHTML = cats.map(c => `<button onclick="renderMenu('${res}', '${c}', this)">${c}</button>`).join('');
    renderMenu(res, cats[0], document.querySelector('#menu-depth3 button'));
}
function renderMenu(res, cat, btn) {
    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('app').innerHTML = menuData[res][cat].map(i => `
        <div class="menu-card" onclick="copy('${i.cn}')">
            <div class="text-area">
                <div class="cn-big">${i.cn} <span class="py-small">${i.py}</span></div>
                <div class="kr-read">${i.kr_read}</div>
                <div class="kr-med">${i.kr}</div>
            </div>
            <div class="price-circle">¥${i.price}</div>
        </div>`).join('');
}

window.onload = () => showLocationTab(document.getElementById('btn-loc'));
