function copy(text) { navigator.clipboard.writeText(text); alert("복사: " + text); }

function renderLocCard(cat, idx, btn) {
    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    const item = window[cat + 'Data'][idx];
    const stationMatch = item.sub.match(/(.*?)\((.*?)\) - (.*)/);
    const stationKr = stationMatch ? stationMatch[1].trim() : item.sub.split('-')[0].trim();
    const stationCn = stationMatch ? stationMatch[2].trim() : "";
    const lines = item.sub.match(/\d+/g) || [];
    const lineTags = lines.map(l => `<span class="subway-tag line-${l}">${l}</span>`).join('');
    
    const descHtml = item.desc ? `<div class="desc">${item.desc}</div>` : "";
    
    document.getElementById('app').innerHTML = `
        <div class="card" onclick="copy('${item.cn}')">
            <div>
                <div class="kr-med">${item.kr}</div>
                <div class="cn-big">${item.cn}</div>
            </div>
            <div class="addr-line" onclick="event.stopPropagation(); copy('${item.addr}')">주소 ${item.addr}</div>
            <div class="subway-line">
                <span class="station-kr">${stationKr.replace('역', '')}</span>
                <span class="station-cn">${stationCn}</span>
                ${lineTags}
            </div>
            ${descHtml}
        </div>`;
}

function showLocationTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('menu-depth2').innerHTML = `
        <button onclick="renderLocation('hotel', this)">호텔</button>
        <button onclick="renderLocation('tour', this)">관광지</button>
        <button onclick="renderLocation('restaurant', this)">식당</button>`;
    renderLocation('tour', document.querySelectorAll('#menu-depth2 button')[1]);
}

function renderLocation(cat, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const list = window[cat + 'Data'];
    document.getElementById('menu-depth3').innerHTML = list.map((i, idx) => `
        <button onclick="renderLocCard('${cat}', ${idx}, this)">${i.kr}</button>`).join('');
    renderLocCard(cat, 0, document.querySelector('#menu-depth3 button'));
}

function showMenuTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('menu-depth2').innerHTML = Object.keys(menuData).map(res => `
        <button onclick="loadMenu('${res}', this)">${resName[res]}</button>`).join('');
    loadMenu(Object.keys(menuData)[0], document.querySelector('#menu-depth2 button'));
}

function loadMenu(res, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cats = Object.keys(menuData[res]);
    document.getElementById('menu-depth3').innerHTML = cats.map(c => `
        <button onclick="renderMenu('${res}', '${c}', this)">${c}</button>`).join('');
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
