// 복사 로직
function copy(text) { navigator.clipboard.writeText(text); alert("복사 완료: " + text); }

// 1. 위치 탭 (기본 실행)
function showLocationTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    document.getElementById('menu-depth2').innerHTML = 
        `<button onclick="renderLocation('hotel', this)">호텔</button>` +
        `<button onclick="renderLocation('tour', this)">관광지</button>` +
        `<button onclick="renderLocation('restaurant', this)">식당</button>`;
    
    // 기본값: 호텔 렌더링
    renderLocation('hotel', document.querySelector('#menu-depth2 button:first-child'));
}

function renderLocation(cat, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    const list = window[cat + 'Data'];
    document.getElementById('menu-depth3').innerHTML = list.map((i, idx) => 
        `<button onclick="renderLocCard('${cat}', ${idx}, this)">${i.kr}</button>`
    ).join('');
    
    renderLocCard(cat, 0, document.querySelector('#menu-depth3 button:first-child'));
}

function renderLocCard(cat, idx, btn) {
    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    const item = window[cat + 'Data'][idx];
    document.getElementById('app').innerHTML = `
        <div class="card" onclick="copy('${item.cn}')">
            <div class="kr-med" style="font-size:18px; font-weight:bold;">${item.kr}</div>
            <div class="cn-big">${item.cn}</div>
            <div class="label">주소: ${item.addr}</div>
            <div class="label">역: ${item.sub}</div>
        </div>`;
}

// 2. 메뉴 탭
function showMenuTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    document.getElementById('menu-depth2').innerHTML = 
        `<button onclick="loadMenu('jiajia', this)">지아지아탕바오</button>` +
        `<button onclick="loadMenu('dahuchun', this)">다후춘</button>`;
    
    loadMenu('jiajia', document.querySelector('#menu-depth2 button:first-child'));
}

function loadMenu(res, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    const cats = Object.keys(menuData[res]);
    document.getElementById('menu-depth3').innerHTML = cats.map(c => 
        `<button onclick="renderMenu('${res}', '${c}', this)">${c}</button>`
    ).join('');
    
    renderMenu(res, cats[0], document.querySelector('#menu-depth3 button:first-child'));
}

function renderMenu(res, cat, btn) {
    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    document.getElementById('app').innerHTML = menuData[res][cat].map(i => `
        <div class="menu-card" onclick="copy('${i.cn}')">
            <div class="text-area">
                <div><span class="cn-big">${i.cn}</span><span class="py-small">${i.py}</span></div>
                <div class="kr-med">${i.kr}</div>
            </div>
            <div class="price-circle">${i.price}</div>
        </div>`).join('');
}

// 시작점: 페이지 로드 시 위치 탭(호텔) 자동 실행
window.onload = () => {
    showLocationTab(document.getElementById('btn-loc'));
};
