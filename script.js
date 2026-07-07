// 식당 ID와 실제 이름 매칭
const resName = {
    jiajia: '지아지아탕바오',
    dahuchun: '다후춘',
    haidilao: '하이디라오',
    jiangbian: '강변성외(카오유)'
};

// 복사 기능
function copy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert("복사 완료: " + text);
    });
}

// 초기 로드: '위치' 탭의 '관광지'를 먼저 보여줌
window.onload = () => {
    showLocationTab(document.getElementById('btn-loc'));
};

// 위치 카드 렌더링
function renderLocCard(cat, idx, btn) {
    const list = window[cat + 'Data'];
    if (!list || !list[idx]) return;

    // 3차 메뉴 버튼 활성화 상태 변경
    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    const item = list[idx];
    
    // 지하철 정보 처리
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
            <span class="label-small">지하철</span>
            <div class="subway-line">
                <span class="kr-sub">${krPart}</span>
                <span class="cn-sub">${cnPart}</span>
                ${lineTags}
            </div>
            ${descHtml}
        </div>`;
    window.scrollTo(0, 0);
}

// 위치 탭 클릭
function showLocationTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('menu-depth2').innerHTML = `
        <button onclick="renderLocation('hotel', this)">호텔</button>
        <button onclick="renderLocation('tour', this)">관광지</button>
        <button onclick="renderLocation('restaurant', this)">식당</button>`;
    
    // 기본으로 관광지 선택
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

// 메뉴 탭 클릭
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
