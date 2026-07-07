// 식당 ID와 화면에 표시할 이름 매칭
const resName = {
    jiajia: '지아지아탕바오',
    dahuchun: '다후춘',
    haidilao: '하이디라오',
    jiangbian: '강변성외'
};

// 복사 함수
function copy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert("복사 완료: " + text);
    });
}

// [초기 실행] 페이지 열리면 호텔/공항 탭을 바로 실행
window.onload = () => {
    const btnLoc = document.getElementById('btn-loc');
    if (btnLoc) showLocationTab(btnLoc);
};

// --- 위치(호텔/관광지/식당) 렌더링 함수 ---
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
        if (item.sub.includes('Maglev')) lineTags += `<span class="subway-tag maglev">M</span>`;
    }
    
    let descHtml = "";
    if (item.desc) {
        const lines = item.desc.split('\n');
        const firstLine = lines[0];
        const remainingText = lines.slice(1).join('\n').trim();
        const bodyHtml = remainingText.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
        
        descHtml = `<div class="desc"><div class="desc-header">${firstLine}</div><div class="desc-body">${bodyHtml}</div></div>`;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="card">
            <div onclick="copy('${item.cn}')">
                <div class="kr-med">${item.kr}</div>
                <div class="cn-big">${item.cn}</div>
            </div>
            <span class="label-small">주소 (클릭 시 복사)</span>
            <div class="content-text" onclick="copy('${item.addr}')">${item.addr}</div>
            <span class="label-small">지하철 (클릭 시 중국어 역명 복사)</span>
            <div class="subway-line" onclick="copy('${cnPart}')">
                <span class="kr-sub">${krPart}</span><span class="cn-sub">${cnPart}</span>
                <div class="subway-tags">${lineTags}</div>
            </div>
            ${descHtml}
        </div>`;
    window.scrollTo(0, 0);
}

function showLocationTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('menu-depth2').innerHTML = `
        <button onclick="renderLocation('hotel', this)">호텔/공항</button>
        <button onclick="renderLocation('tour', this)">관광지</button>
        <button onclick="renderLocation('restaurant', this)">식당</button>`;
    renderLocation('hotel', document.querySelectorAll('#menu-depth2 button')[0]);
}

function renderLocation(cat, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const list = window[cat + 'Data'];
    if(!list) { alert(cat + " 데이터 파일이 없습니다."); return; }
    document.getElementById('menu-depth3').innerHTML = list.map((i, idx) => `
        <button onclick="renderLocCard('${cat}', ${idx}, this)">${i.kr}</button>`).join('');
    renderLocCard(cat, 0, document.querySelector('#menu-depth3 button'));
}

// --- 메뉴(식당 음식) 렌더링 함수 ---
function showMenuTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // 데이터 로드 확인
    if (!window.menuData) {
        alert("menu_data.js 파일을 찾을 수 없거나 데이터가 비어있습니다.");
        return;
    }
    
    const resKeys = Object.keys(window.menuData);
    document.getElementById('menu-depth2').innerHTML = resKeys.map(res => `
        <button onclick="loadMenu('${res}', this)">${resName[res] || res}</button>`).join('');
    
    // 첫 번째 식당 자동 로드
    loadMenu(resKeys[0], document.querySelectorAll('#menu-depth2 button')[0]);
}

function loadMenu(res, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const currentResData = window.menuData[res];
    if(!currentResData) return;

    const cats = Object.keys(currentResData);
    document.getElementById('menu-depth3').innerHTML = cats.map(c => `
        <button onclick="renderMenu('${res}', '${c}', this)">${c}</button>`).join('');
    
    // 첫 번째 카테고리 자동 로드
    renderMenu(res, cats[0], document.querySelector('#menu-depth3 button'));
}

function renderMenu(res, cat, btn) {
    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    const items = window.menuData[res][cat];
    document.getElementById('app').innerHTML = items.map(i => `
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
