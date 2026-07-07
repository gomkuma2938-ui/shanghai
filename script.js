const resName = {
    jiajia: '지아지아탕바오',
    dahuchun: '다후춘',
    haidilao: '하이디라오',
    jiangbian: '강변성외(카오유)'
};

function copy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert("복사 완료: " + text);
    });
}

// 초기 로드: 이제 '호텔/공항'이 먼저 나오도록 설정
window.onload = () => {
    showLocationTab(document.getElementById('btn-loc'));
};

function renderLocCard(cat, idx, btn) {
    const list = window[cat + 'Data'];
    if (!list || !list[idx]) return;

    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    const item = list[idx];
    
    let krPart = "", cnPart = "", lineTags = "";
    if (item.sub) {
        const subParts = item.sub.split('-');
        const mainSub = subParts[0].trim();
        let stationMatch = mainSub.match(/(.*?)\((.*?)\)/);
        krPart = stationMatch ? stationMatch[1].trim() : mainSub;
        if (!krPart.endsWith('역')) krPart += '역';
        cnPart = stationMatch ? stationMatch[2].trim() : "";
        
        const lines = item.sub.match(/\d+/g) || [];
        lineTags = lines.map(l => `<span class="subway-tag line-${l}">${l}</span>`).join('');
        
        // Maglev(자기부상열차) 표시를 위한 예외 처리
        if (item.sub.includes('Maglev')) {
            lineTags += `<span class="subway-tag maglev">M</span>`;
        }
    }
    
    const descHtml = item.desc ? `<div class="desc">${item.desc.replace(/\n\n/g, '<p></p>')}</div>` : "";
    
    document.getElementById('app').innerHTML = `
        <div class="card">
            <div onclick="copy('${item.cn}')">
                <div class="kr-med">${item.kr}</div>
                <div class="cn-big">${item.cn}</div>
            </div>
            <span class="label-small">주소 (클릭 시 복사)</span>
            <div class="content-text" onclick="copy('${item.addr}')">${item.addr}</div>
            <span class="label-small">지하철/교통</span>
            <div class="subway-line">
                <span class="kr-sub">${krPart}</span>
                <span class="cn-sub">${cnPart}</span>
                ${lineTags}
            </div>
            ${descHtml}
        </div>`;
    window.scrollTo(0, 0);
}

function showLocationTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // 2차 메뉴 이름을 '호텔/공항'으로 변경
    document.getElementById('menu-depth2').innerHTML = `
        <button onclick="renderLocation('hotel', this)">호텔/공항</button>
        <button onclick="renderLocation('tour', this)">관광지</button>
        <button onclick="renderLocation('restaurant', this)">식당</button>`;
    
    // 첫 번째 버튼(호텔/공항)을 자동으로 클릭하도록 설정
    renderLocation('hotel', document.querySelectorAll('#menu-depth2 button')[0]);
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
    if (typeof menuData === 'undefined') return;
    const resKeys = Object.keys(menuData);
    document.getElementById('menu-depth2').innerHTML = resKeys.map(res => `
        <button onclick="loadMenu('${res}', this)">${resName[res] || res}</button>`).join('');
    loadMenu(resKeys[0], document.querySelectorAll('#menu-depth2 button')[0]);
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
    window.scrollTo(0, 0);
}
