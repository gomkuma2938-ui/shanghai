/**
 * 상하이 여행 가이드 - 로직 스크립트
 * 모든 기능이 통합된 가독성 중심 버전입니다.
 */

// 1. 기본 설정 및 상수
const resName = {
    jiajia: '지아지아탕바오',
    dahuchun: '다후춘',
    haidilao: '하이디라오',
    jiangbian: '강변성외'
};

let calcExpr = "0"; // 계산기 입력값
let currentRate = localStorage.getItem('exchangeRate') || 223.0; // 환율

// 2. 공통 유틸리티 함수
function copy(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        alert("복사 완료: " + text);
    });
}

// 푸터 버튼 활성화 표시
function setActiveFooter(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // 마지막으로 누른 푸터 버튼의 ID를 저장합니다.
    if (btn.id) {
        localStorage.setItem('lastTabId', btn.id);
    }
}

// 앱 레이아웃 모드 설정 (all: 2줄바, mid: 1줄바, none: 바없음)
function setAppLayout(mode) {
    const depth2 = document.getElementById('menu-depth2');
    const depth3 = document.getElementById('menu-depth3');

    document.body.classList.remove('layout-all', 'layout-mid', 'layout-none');
    document.body.classList.add('layout-' + mode);

    if (mode === 'none') {
        depth2.innerHTML = "";
        depth3.innerHTML = "";
    } else if (mode === 'mid') {
        depth3.innerHTML = "";
    }
    
    // 내용이 바뀌기 전후로 스크롤을 맨 위로 보냅니다.
    window.scrollTo(0, 0); 
    setTimeout(() => window.scrollTo(0, 0), 10); // 렌더링 찰나의 순간 대응
}

// 3. 초기화 (위치 탭 먼저 실행)
window.onload = () => {
    const lastTabId = localStorage.getItem('lastTabId') || 'btn-loc'; // 없으면 위치탭 기본
    const btn = document.getElementById(lastTabId);
    
    if (btn) {
        // 저장된 탭 ID에 따라 해당 함수 실행
        if (lastTabId === 'btn-loc') showLocationTab(btn);
        else if (lastTabId === 'btn-menu') showMenuTab(btn);
        else if (lastTabId === 'btn-calc') showCalcTab(btn);
        else if (lastTabId === 'btn-talk') showTalkTab(btn);
        else if (lastTabId === 'btn-info') showInfoTab(btn);
    }
};

// ==========================================
// [탭 1: 위치 정보 관련]
// ==========================================

function showLocationTab(btn) {
    setAppLayout('all');
    setActiveFooter(btn);

    document.getElementById('menu-depth2').innerHTML = `
        <button onclick="renderLocation('hotel', this)">호텔/공항</button>
        <button onclick="renderLocation('tour', this)">관광지</button>
        <button onclick="renderLocation('restaurant', this)">식당</button>
    `;
    renderLocation('hotel', document.querySelectorAll('#menu-depth2 button')[0]);
}

function renderLocation(cat, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const list = window[cat + 'Data'];
    if (!list) return;

    document.getElementById('menu-depth3').innerHTML = list.map((i, idx) => `
        <button onclick="renderLocCard('${cat}', ${idx}, this)">${i.kr}</button>
    `).join('');
    
    renderLocCard(cat, 0, document.querySelector('#menu-depth3 button'));
}

function renderLocCard(cat, idx, btn) {
    const list = window[cat + 'Data'];
    if (!list || !list[idx]) return;

    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const item = list[idx];
    let krPart = "", cnPart = "", lineTags = "";

    // 지하철 정보 파싱
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

    // 운영시간 및 설명 HTML 구성
    let hoursHtml = item.hours ? `<span class="label-hours">운영시간</span><div class="content-hours">${item.hours}</div>` : "";
    let descHtml = "";
    if (item.desc) {
        const lines = item.desc.split('\n');
        const firstLine = lines[0];
        const bodyHtml = lines.slice(1).join('\n').trim().split('\n').map(p => {
            return p.trim() ? `<p class="desc-para">${p.trim()}</p>` : '';
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
            ${hoursHtml}
            ${descHtml}
        </div>
    `;
    window.scrollTo(0, 0);
}

// ==========================================
// [탭 2: 메뉴판 관련]
// ==========================================

function showMenuTab(btn) {
    setAppLayout('all');
    setActiveFooter(btn);

    const resKeys = Object.keys(window.menuData);
    document.getElementById('menu-depth2').innerHTML = resKeys.map(res => `
        <button onclick="loadMenu('${res}', this)">${resName[res] || res}</button>
    `).join('');
    loadMenu(resKeys[0], document.querySelectorAll('#menu-depth2 button')[0]);
}

function loadMenu(res, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cats = Object.keys(window.menuData[res]);
    document.getElementById('menu-depth3').innerHTML = cats.map(c => `
        <button onclick="renderMenu('${res}', '${c}', this)">${c}</button>
    `).join('');
    renderMenu(res, cats[0], document.querySelector('#menu-depth3 button'));
}

function renderMenu(res, cat, btn) {
    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const items = window.menuData[res][cat];
    document.getElementById('app').innerHTML = items.map(i => `
        <div class="menu-card" onclick="copy('${i.cn}')">
            <div class="text-area">
                <div class="cn-big-menu">${i.cn}</div>
                <div class="kr-med-menu">${i.kr}</div>
                <div class="py-read-row">${i.py} / ${i.kr_read}</div>
            </div>
            <div class="price-circle-fill">¥${i.price}</div>
        </div>
    `).join('');
    window.scrollTo(0, 0);
}

// ==========================================
// [탭 3: 계산기 관련]
// ==========================================

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
    if (key === 'AC') {
        calcExpr = "0";
    } else if (key === 'DEL') {
        calcExpr = calcExpr.length > 1 ? calcExpr.slice(0, -1) : "0";
    } else if (key === '=') {
        try {
            calcExpr = String(eval(calcExpr.replace(/×/g, '*').replace(/÷/g, '/')));
        } catch {
            calcExpr = "Error";
        }
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
    try {
        resultNum = eval(calcExpr.replace(/×/g, '*').replace(/÷/g, '/')) || 0;
    } catch {
        resultNum = 0;
    }

    cnyElement.innerText = calcExpr + " CNY";
    krwElement.innerHTML = Math.round(resultNum * currentRate).toLocaleString() + "<span>원</span>";
}

function updateRate(val) {
    if (!val || val <= 0) return;
    currentRate = parseFloat(val);
    localStorage.setItem('exchangeRate', currentRate);
    updateCalcDisplay();
}

// ==========================================
// [탭 4: 필수 회화 관련]
// ==========================================

function showTalkTab(btn) {
    setAppLayout('mid');
    setActiveFooter(btn);

    const categories = Object.keys(window.talkData);
    document.getElementById('menu-depth2').innerHTML = categories.map(cat => `
        <button onclick="renderTalkCategory('${cat}', this)">${cat}</button>
    `).join('');
    
    renderTalkCategory(categories[0], document.querySelector('#menu-depth2 button'));
}

function renderTalkCategory(cat, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const items = window.talkData[cat] || [];
    document.getElementById('app').innerHTML = `
        <div style="padding:10px 5px;">
            ${items.map(t => `
                <div class="talk-item" onclick="copy('${t.cn}')">
                    <div style="flex:1">
                        <div class="talk-cn">${t.cn}</div>
                        <div class="talk-py-read">${t.py} / ${t.kr_read}</div>
                        <div class="talk-kr-desc">${t.kr}</div>
                    </div>
                    <div class="talk-copy-tag">복사</div>
                </div>
            `).join('')}
        </div>`;
}

// ==========================================
// [탭 5: 정보 (멤버/일정) 관련] - 3뎁스 구조 개편
// ==========================================

function showInfoTab(btn) {
    // 일단 2뎁스만 보이는 mid 모드로 시작
    setAppLayout('mid');
    setActiveFooter(btn);

    document.getElementById('menu-depth2').innerHTML = `
        <button onclick="renderInfoMembers(this)">일행 정보</button>
        <button onclick="renderInfoScheduleTab(this)">여행 일정</button>
    `;
    
    // 기본값으로 일행 정보 표시
    renderInfoMembers(document.querySelector('#menu-depth2 button'));
}

// 5-1. 일행 정보 화면 (2뎁스 유지)
function renderInfoMembers(btn) {
    setAppLayout('mid'); // 3뎁스 숨김
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    let html = `<div style="padding:10px 5px;"><div style="font-weight:900; font-size:18px; margin-bottom:15px;">👥 일행 정보 (4명)</div>`;
    
    for (let i = 1; i <= 4; i++) {
        const n = localStorage.getItem(`mem-n-${i}`) || "";
        const sn = localStorage.getItem(`mem-sn-${i}`) || "";
        const gn = localStorage.getItem(`mem-gn-${i}`) || "";
        const p = localStorage.getItem(`mem-p-${i}`) || "";
        const b = localStorage.getItem(`mem-b-${i}`) || "";
        const e = localStorage.getItem(`mem-e-${i}`) || "";

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
    document.getElementById('app').innerHTML = html + `</div>`;
}

// 5-2. 여행 일정 탭 설정 (3뎁스 활성화)
function renderInfoScheduleTab(btn) {
    setAppLayout('all'); // 3뎁스(depth3) 바 보이기 모드로 전환
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const sch = window.scheduleData || {};
    const days = Object.keys(sch);

    // 3뎁스 바에 1일차, 2일차... 버튼 생성
    document.getElementById('menu-depth3').innerHTML = days.map((day, idx) => `
        <button onclick="renderDaySchedule('${day}', this)">${day}</button>
    `).join('');

    // 첫 번째 날짜 일정 자동 로드
    renderDaySchedule(days[0], document.querySelector('#menu-depth3 button'));
}

// 5-3. 실제 특정 날짜의 일정 렌더링
function renderDaySchedule(day, btn) {
    document.querySelectorAll('#menu-depth3 button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const sch = window.scheduleData[day] || [];
    let html = `<div style="padding:10px 5px;">`;

    html += sch.map(s => `
        <div class="schedule-item">
            <div class="sch-time">${s.time}</div>
            <div class="sch-info">
                <div class="sch-title">${s.title}</div>
                <div class="sch-memo">${s.memo}</div>
            </div>
        </div>`).join('');
    
    document.getElementById('app').innerHTML = html + `</div>`;
    window.scrollTo(0, 0);
}

// 보조: 정보 입력 행 구성
function renderInfoRow(idx, key, label, val, ph, isDate = false) {
    const id = `${key}-${idx}`;
    const onInput = isDate ? `oninput="formatDateInput(this)"` : "";
    return `
        <div class="info-row">
            <label>${label}</label>
            <input type="text" id="${id}" value="${val}" ${onInput} onchange="saveMem(${idx})" placeholder="${ph}">
            <button class="btn-copy-small" onclick="copy(document.getElementById('${id}').value)">복사</button>
        </div>`;
}

// 보조: 날짜 하이픈 자동 생성
function formatDateInput(obj) {
    let v = obj.value.replace(/\D/g, "");
    if (v.length > 8) v = v.substring(0, 8);
    if (v.length > 4 && v.length <= 6) {
        v = v.substring(0, 4) + "-" + v.substring(4);
    } else if (v.length > 6) {
        v = v.substring(0, 4) + "-" + v.substring(4, 6) + "-" + v.substring(6);
    }
    obj.value = v;
}

// 보조: 멤버 데이터 저장
function saveMem(i) {
    localStorage.setItem(`mem-n-${i}`, document.getElementById(`n-${i}`).value);
    localStorage.setItem(`mem-sn-${i}`, document.getElementById(`sn-${i}`).value);
    localStorage.setItem(`mem-gn-${i}`, document.getElementById(`gn-${i}`).value);
    localStorage.setItem(`mem-p-${i}`, document.getElementById(`p-${i}`).value);
    localStorage.setItem(`mem-b-${i}`, document.getElementById(`b-${i}`).value);
    localStorage.setItem(`mem-e-${i}`, document.getElementById(`e-${i}`).value);
}
