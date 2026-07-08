const resName = {
    jiajia: '지아지아탕바오',
    dahuchun: '다후춘',
    haidilao: '하이디라오',
    jiangbian: '강변성외'
};

// --- [공통] 텍스트 복사 기능 ---
function copy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert("복사 완료: " + text);
    });
}

// 초기 로드 시 위치 탭 활성화
window.onload = () => {
    const btnLoc = document.getElementById('btn-loc');
    if (btnLoc) showLocationTab(btnLoc);
};

// --- [핵심] 레이아웃 및 상단바 제어 함수 ---
function setAppLayout(mode) {
    const depth2 = document.getElementById('menu-depth2');
    const depth3 = document.getElementById('menu-depth3');
    
    document.body.classList.remove('layout-all', 'layout-mid', 'layout-none');
    document.body.classList.add('layout-' + mode);

    if (mode === 'none') {
        if (depth2) depth2.innerHTML = "";
        if (depth3) depth3.innerHTML = "";
    } else if (mode === 'mid') {
        if (depth3) depth3.innerHTML = ""; 
    }
    window.scrollTo(0, 0);
}

// 푸터 버튼 활성화 상태 표시
function setActiveFooter(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// --- [1. 위치 탭] ---
function showLocationTab(btn) {
    setAppLayout('all');
    setActiveFooter(btn);
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
    if(!list) return;
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
        const bodyHtml = lines.slice(1).join('\n').trim().split('\n').map(p => {
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

// --- [2. 메뉴 탭] ---
function showMenuTab(btn) {
    setAppLayout('all');
    setActiveFooter(btn);
    const resKeys = Object.keys(window.menuData);
    document.getElementById('menu-depth2').innerHTML = resKeys.map(res => `
        <button onclick="loadMenu('${res}', this)">${resName[res] || res}</button>`).join('');
    loadMenu(resKeys[0], document.querySelectorAll('#menu-depth2 button')[0]);
}

function loadMenu(res, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cats = Object.keys(window.menuData[res]);
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

// --- [3. 계산기 탭] ---
let calcExpr = "0"; 
let currentRate = localStorage.getItem('exchangeRate') || 223.0;

function showCalcTab(btn) {
    setAppLayout('none');
    setActiveFooter(btn);
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
                <button onclick="pressCalc('7')">7</button><button onclick="pressCalc('8')">8</button><button onclick="pressCalc('9')">9</button><button class="op" onclick="pressCalc('-')">-</button>
                <button onclick="pressCalc('4')">4</button><button onclick="pressCalc('5')">5</button><button onclick="pressCalc('6')">6</button><button class="op" onclick="pressCalc('+')">+</button>
                <button onclick="pressCalc('1')">1</button><button onclick="pressCalc('2')">2</button><button onclick="pressCalc('3')">3</button><button onclick="pressCalc('.')">.</button>
                <button onclick="pressCalc('0')">0</button><button onclick="pressCalc('00')">00</button><button class="eq" onclick="pressCalc('=')">=</button>
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
    if (key === 'AC') calcExpr = "0";
    else if (key === 'DEL') calcExpr = calcExpr.length > 1 ? calcExpr.slice(0, -1) : "0";
    else if (key === '=') {
        try { calcExpr = String(eval(calcExpr.replace(/×/g, '*').replace(/÷/g, '/'))); } catch { calcExpr = "Error"; }
    } else {
        if (calcExpr === "0" && key !== '.') calcExpr = key;
        else calcExpr += key;
    }
    updateCalcDisplay();
}

function updateCalcDisplay() {
    const cnyElement = document.getElementById('cny-val');
    const krwElement = document.getElementById('krw-val');
    if (!cnyElement || !krwElement) return;
    let resultNum = 0;
    try { resultNum = eval(calcExpr.replace(/×/g, '*').replace(/÷/g, '/')) || 0; } catch { resultNum = 0; }
    cnyElement.innerText = calcExpr + " CNY";
    krwElement.innerHTML = Math.round(resultNum * currentRate).toLocaleString() + "<span>원</span>";
}

function updateRate(val) {
    if (!val || val <= 0) return;
    currentRate = parseFloat(val);
    localStorage.setItem('exchangeRate', currentRate);
    updateCalcDisplay();
}

// --- [4. 회화 탭] ---
function showTalkTab(btn) {
    setAppLayout('mid'); 
    setActiveFooter(btn);
    const categories = Object.keys(window.talkData);
    document.getElementById('menu-depth2').innerHTML = categories.map(cat => `
        <button onclick="renderTalkCategory('${cat}', this)">${cat}</button>`).join('');
    renderTalkCategory(categories[0], document.querySelector('#menu-depth2 button'));
}

function renderTalkCategory(cat, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    const items = window.talkData[cat] || [];
    document.getElementById('app').innerHTML = `<div style="padding:10px 5px;">` + items.map(t => `
        <div class="talk-item" onclick="copy('${t.cn}')">
            <div style="flex:1">
                <div class="talk-cn">${t.cn}</div>
                <div class="talk-py-read">${t.py} / ${t.kr_read}</div>
                <div class="talk-kr-desc">${t.kr}</div>
            </div>
            <div class="talk-copy-tag">복사</div>
        </div>`).join('') + `</div>`;
}

// --- [5. 정보 탭] (6가지 항목 + 하이픈 + 복사버튼) ---
function showInfoTab(btn) {
    setAppLayout('none');
    setActiveFooter(btn);
    
    let html = `<div style="padding:10px 5px;"><div style="font-weight:900; font-size:20px; margin-bottom:20px;">👥 일행 정보 (4명)</div>`;
    
    for (let i = 1; i <= 4; i++) {
        const n = localStorage.getItem(`mem-n-${i}`) || "";   // 이름
        const sn = localStorage.getItem(`mem-sn-${i}`) || ""; // 영문 성
        const gn = localStorage.getItem(`mem-gn-${i}`) || ""; // 영문 이름
        const p = localStorage.getItem(`mem-p-${i}`) || "";   // 여권번호
        const b = localStorage.getItem(`mem-b-${i}`) || "";   // 생년월일
        const e = localStorage.getItem(`mem-e-${i}`) || "";   // 만료일

        html += `
            <div class="member-card">
                <div class="member-header">멤버 ${i}</div>
                ${renderInfoRow(i, 'n', '이름', n, '홍길동')}
                ${renderInfoRow(i, 'sn', '영문 성', sn, 'HONG')}
                ${renderInfoRow(i, 'gn', '영문 이름', gn, 'GILDONG')}
                ${renderInfoRow(i, 'p', '여권번호', p, 'M00000000')}
                ${renderInfoRow(i, 'b', '생년월일', b, '1990-01-01', true)}
                ${renderInfoRow(i, 'e', '여권만료', e, '2030-01-01', true)}
            </div>`;
    }
    document.getElementById('app').innerHTML = html + `<p style="font-size:11px; color:#999; text-align:center;">날짜는 숫자 8자리를 치면 자동으로 하이픈이 생깁니다.</p></div>`;
}

function renderInfoRow(idx, key, label, value, placeholder, isDate = false) {
    const id = `${key}-${idx}`;
    const onInput = isDate ? `oninput="formatDateInput(this)"` : "";
    return `
        <div class="info-row">
            <label>${label}</label>
            <input type="text" id="${id}" value="${value}" ${onInput} onchange="saveMem(${idx})" placeholder="${placeholder}">
            <button class="btn-copy-small" onclick="copy(document.getElementById('${id}').value)">복사</button>
        </div>`;
}

function formatDateInput(obj) {
    let val = obj.value.replace(/\D/g, "");
    if (val.length > 8) val = val.substring(0, 8);
    if (val.length > 4 && val.length <= 6) {
        val = val.substring(0, 4) + "-" + val.substring(4);
    } else if (val.length > 6) {
        val = val.substring(0, 4) + "-" + val.substring(4, 6) + "-" + val.substring(6);
    }
    obj.value = val;
}

function saveMem(i) {
    localStorage.setItem(`mem-n-${i}`, document.getElementById(`n-${i}`).value);
    localStorage.setItem(`mem-sn-${i}`, document.getElementById(`sn-${i}`).value);
    localStorage.setItem(`mem-gn-${i}`, document.getElementById(`gn-${i}`).value);
    localStorage.setItem(`mem-p-${i}`, document.getElementById(`p-${i}`).value);
    localStorage.setItem(`mem-b-${i}`, document.getElementById(`b-${i}`).value);
    localStorage.setItem(`mem-e-${i}`, document.getElementById(`e-${i}`).value);
}
