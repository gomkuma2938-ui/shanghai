function copy(text) { navigator.clipboard.writeText(text); alert("복사: " + text); }

function formatSubway(subText) {
    const stationMatch = subText.match(/(.*?)역\((.*?)\)/);
    const stationKr = stationMatch ? stationMatch[1] : subText.split('역')[0];
    const stationCn = stationMatch ? stationMatch[2] : "";
    const lines = subText.match(/\d+(?=호선)/g) || [];
    const lineHtml = lines.map(l => `<span class="subway-tag line-${l}">${l}</span>`).join('');
    
    return `
        <div class="subway-container">
            <div class="line-list" style="margin-bottom: 5px;">${lineHtml}</div>
            <div onclick="copy('${stationKr} ${stationCn}')" style="cursor:pointer; font-weight:700;">
                ${stationKr} <span style="font-size:12px; color:#666;">(${stationCn})</span>
            </div>
        </div>`;
}

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
    const descHtml = item.desc ? `<div class="label" style="font-size:14px; color:#777; margin-top:15px; font-style:italic; line-height:1.6;">"${item.desc}"</div>` : '';
    document.getElementById('app').innerHTML = `
        <div class="card">
            <div onclick="copy('${item.cn}')">
                <div class="kr-med">${item.kr}</div>
                <div class="cn-big">${item.cn}</div>
            </div>
            <div class="label" onclick="copy('${item.addr}')" style="font-size:15px; color:#333; margin-top:12px; line-height:1.5; font-weight:500; cursor:pointer;">주소: ${item.addr}</div>
            <div class="label" style="font-size:15px; color:#333; margin-top:12px; line-height:1.5; font-weight:500;">지하철: ${formatSubway(item.sub)}</div>
            ${descHtml}
        </div>`;
}

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
