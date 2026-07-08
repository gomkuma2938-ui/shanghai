const resName = {
    jiajia: '지아지아탕바오',
    dahuchun: '다후춘',
    haidilao: '하이디라오',
    jiangbian: '강변성외'
};

// --- 공통 기능 ---
function copy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert("복사 완료: " + text);
    });
}

window.onload = () => {
    const btnLoc = document.getElementById('btn-loc');
    if (btnLoc) showLocationTab(btnLoc);
};

// --- 탭 전환 및 상단바 제어 통합 함수 ---
function setTopBar(isVisible) {
    const depth2 = document.getElementById('menu-depth2');
    const depth3 = document.getElementById('menu-depth3');

    if (isVisible) {
        document.body.classList.remove('hide-top-bar');
    } else {
        document.body.classList.add('hide-top-bar');
        // 내용 비우기 (공간 제거를 위해 중요)
        if (depth2) depth2.innerHTML = "";
        if (depth3) depth3.innerHTML = "";
    }
}

// 1. 위치 탭 (상단바 보임)
function showLocationTab(btn) {
    setTopBar(true); 
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('menu-depth2').innerHTML = `
        <button onclick="renderLocation('hotel', this)">호텔/공항</button>
        <button onclick="renderLocation('tour', this)">관광지</button>
        <button onclick="renderLocation('restaurant', this)">식당</button>`;
    renderLocation('hotel', document.querySelectorAll('#menu-depth2 button')[0]);
}

// 2. 메뉴 탭 (상단바 보임)
function showMenuTab(btn) {
    setTopBar(true);
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const resKeys = Object.keys(window.menuData);
    document.getElementById('menu-depth2').innerHTML = resKeys.map(res => `
        <button onclick="loadMenu('${res}', this)">${resName[res] || res}</button>`).join('');
    loadMenu(resKeys[0], document.querySelectorAll('#menu-depth2 button')[0]);
}

// 3. 계산기 탭 (상단바 숨김)
function showCalcTab(btn) {
    setTopBar(false);
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCalculator(); // 기존에 작성된 계산기 렌더링 함수 실행
}

// 4. 회화 탭 (상단바 숨김 + 기존 분류 로직)
function showTalkTab(btn) {
    setTopBar(false);
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const talkData = window.talkData || {};
    const categories = Object.keys(talkData);
    let html = `<div style="padding:10px 5px;"><div style="font-weight:900; font-size:22px; margin-bottom:20px;">🗣️ 필수 회화</div>`;

    categories.forEach(cat => {
        html += `<div class="talk-category-title">${cat}</div>`;
        html += talkData[cat].map(t => `
            <div class="talk-item" onclick="copy('${t.cn}')">
                <div style="flex:1">
                    <div class="talk-cn">${t.cn}</div>
                    <div class="talk-py-read">${t.py} / ${t.kr_read}</div>
                    <div class="talk-kr-desc">${t.kr}</div>
                </div>
                <div class="talk-copy-tag">복사</div>
            </div>`).join('');
    });
    document.getElementById('app').innerHTML = html + `</div>`;
    window.scrollTo(0, 0);
}

// 5. 정보 탭 (상단바 숨김 + 4명 정보 로직)
function showInfoTab(btn) {
    setTopBar(false);
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    let html = `<div style="padding:10px 5px;"><div style="font-weight:900; font-size:20px; margin-bottom:20px;">👥 일행 정보 (4명)</div>`;
    for (let i = 1; i <= 4; i++) {
        const n = localStorage.getItem(`mem-n-${i}`) || "";
        const p = localStorage.getItem(`mem-p-${i}`) || "";
        const b = localStorage.getItem(`mem-b-${i}`) || "";
        const e = localStorage.getItem(`mem-e-${i}`) || "";
        html += `
            <div class="member-card">
                <div class="member-header">멤버 ${i}</div>
                <div class="info-row"><label>이름</label><input type="text" id="n-${i}" value="${n}" onchange="saveMem(${i})" placeholder="성명"></div>
                <div class="info-row"><label>여권번호</label><input type="text" id="p-${i}" value="${p}" onchange="saveMem(${i})" placeholder="M00000000"></div>
                <div class="info-row"><label>생년월일</label><input type="text" id="b-${i}" value="${b}" onchange="saveMem(${i})" placeholder="YYMMDD"></div>
                <div class="info-row"><label>여권만료</label><input type="text" id="e-${i}" value="${e}" onchange="saveMem(${i})" placeholder="YYYY-MM-DD"></div>
            </div>`;
    }
    document.getElementById('app').innerHTML = html + `<p style="font-size:11px; color:#999; text-align:center;">입력 시 자동 저장되며 본인 기기에만 남습니다.</p></div>`;
}

// 저장 로직 (만료일 포함)
function saveMem(i) {
    localStorage.setItem(`mem-n-${i}`, document.getElementById(`n-${i}`).value);
    localStorage.setItem(`mem-p-${i}`, document.getElementById(`p-${i}`).value);
    localStorage.setItem(`mem-b-${i}`, document.getElementById(`b-${i}`).value);
    localStorage.setItem(`mem-e-${i}`, document.getElementById(`e-${i}`).value); // 만료일 저장
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
        
        const bodyHtml = remainingText.split('\n').map(p => {
            if (!p.trim()) return '';
            return `<p class="desc-para">${p.trim()}</p>`; 
        }).join('');
        
        descHtml = `<div class="desc"><div class="desc-header">${firstLine}</div><div class="desc-body">${bodyHtml}</div></div>`;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="card">
            <div onclick="copy('${item.cn}')">
                <div class="kr-med">${item.kr}</div>
                <div class="cn-big">${item.cn}</div>
            </div>
            <span class="label-small">주소</span>
            <div class="content-text" onclick="copy('${item.addr}')">${item.addr}</div>
            <span class="label-small">지하철</span>
            <div class="subway-line" onclick="copy('${cnPart}')">
                <span class="cn-sub">${cnPart}</span><span class="kr-sub">${krPart}</span>
                <div class="subway-tags">${lineTags}</div>
            </div>
            ${descHtml}
        </div>`;
    window.scrollTo(0, 0);
}

// --- 메뉴 탭 로직 ---
function showMenuTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (!window.menuData) { alert("menu_data.js 파일을 찾을 수 없습니다."); return; }
    const resKeys = Object.keys(window.menuData);
    document.getElementById('menu-depth2').innerHTML = resKeys.map(res => `
        <button onclick="loadMenu('${res}', this)">${resName[res] || res}</button>`).join('');
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
    renderMenu(res, cats[0], document.querySelector('#menu-depth3 button'));
}

function renderMenu(res, cat, btn) {
    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    const items = window.menuData[res][cat];
    document.getElementById('app').innerHTML = items.map(i => `
        <div class="menu-card" onclick="copy('${i.cn}')">
            <div class="text-area">
                <div class="cn-big-menu">${i.cn}</div>
                <div class="kr-med-menu">${i.kr}</div>
                <div class="py-read-row">${i.py} / ${i.kr_read}</div>
            </div>
            <div class="price-circle-fill">¥${i.price}</div>
        </div>`).join('');
    window.scrollTo(0, 0);
}

// --- 계산기 탭 로직 (추가됨) ---
let calcExpr = "0"; 
let currentRate = localStorage.getItem('exchangeRate') || 223.0;

function showCalcTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // 상단 메뉴 초기화
    document.getElementById('menu-depth2').innerHTML = "";
    document.getElementById('menu-depth3').innerHTML = "";
    
    renderCalculator();
}

function renderCalculator() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="calc-container">
            <div class="calc-display">
                <div class="display-cny" id="cny-val">0 CNY</div>
                <div class="display-krw" id="krw-val">0<span>원</span></div>
            </div>
            <div class="calc-grid">
                <button class="ac" onclick="pressCalc('AC')">AC</button>
                <button class="op" onclick="pressCalc('DEL')">DEL</button>
                <button class="op" onclick="pressCalc('/')">÷</button>
                <button class="op" onclick="pressCalc('*')">×</button>
                <button onclick="pressCalc('7')">7</button>
                <button onclick="pressCalc('8')">8</button>
                <button onclick="pressCalc('9')">9</button>
                <button class="op" onclick="pressCalc('-')">-</button>
                <button onclick="pressCalc('4')">4</button>
                <button onclick="pressCalc('5')">5</button>
                <button onclick="pressCalc('6')">6</button>
                <button class="op" onclick="pressCalc('+')">+</button>
                <button onclick="pressCalc('1')">1</button>
                <button onclick="pressCalc('2')">2</button>
                <button onclick="pressCalc('3')">3</button>
                <button onclick="pressCalc('.')">.</button>
                <button onclick="pressCalc('0')">0</button>
                <button onclick="pressCalc('00')">00</button>
                <button class="eq" onclick="pressCalc('=')">=</button>
            </div>
            <div class="rate-setting">
                <label>환율 설정 (1¥ = )</label>
                <div class="rate-input-wrap">
                    <input type="number" id="rate-input" value="${currentRate}" step="0.1" oninput="updateRate(this.value)">
                    <span>원</span>
                </div>
            </div>
        </div>`;
    updateCalcDisplay();
}

function pressCalc(key) {
    if (key === 'AC') {
        calcExpr = "0";
    } else if (key === 'DEL') {
        calcExpr = calcExpr.length > 1 ? calcExpr.slice(0, -1) : "0";
    } else if (key === '=') {
        try {
            calcExpr = String(eval(calcExpr.replace(/×/g, '*').replace(/÷/g, '/')));
        } catch { calcExpr = "Error"; }
    } else {
        if (calcExpr === "0" && key !== '.') calcExpr = key;
        else if (calcExpr === "Error") calcExpr = key;
        else calcExpr += key;
    }
    updateCalcDisplay();
}

function updateCalcDisplay() {
    const cnyElement = document.getElementById('cny-val');
    const krwElement = document.getElementById('krw-val');
    if (!cnyElement || !krwElement) return;

    let resultNum = 0;
    try {
        resultNum = eval(calcExpr.replace(/×/g, '*').replace(/÷/g, '/')) || 0;
    } catch { resultNum = 0; }

    cnyElement.innerText = calcExpr + " CNY";
    const krwValue = Math.round(resultNum * currentRate);
    krwElement.innerHTML = krwValue.toLocaleString() + "<span>원</span>";
}

function updateRate(val) {
    if (!val || val <= 0) return;
    currentRate = parseFloat(val);
    localStorage.setItem('exchangeRate', currentRate);
    updateCalcDisplay();
}
