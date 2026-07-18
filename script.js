/**
 * 상하이 여행 가이드 - 로직 스크립트
 * 모든 기능이 통합된 가독성 중심 버전입니다.
 */

let calcExpr = "0"; // 계산기 입력값
let currentRate = localStorage.getItem('exchangeRate') || 223.0; // 환율

// onclick 속성에 안전하게 넣기 위한 이스케이프 (작은따옴표, 큰따옴표, 백슬래시 처리)
function escAttr(str) {
    return String(str ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');
}

// 2. 공통 유틸리티 함수
function copy(text, event) {
    if (!text) return;

    // 브라우저의 기본 텍스트 선택 동작 방지
    if (event) {
        event.preventDefault();
    }

    // 기존 선택된 영역 강제 해제
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }

    navigator.clipboard.writeText(text).then(() => {
        showToast("복사 완료: " + text);
    });
}

// 이미지 확대 전역 변수
let startDist = 0, startScale = 1, currentScale = 1;
let translateX = 0, translateY = 0;
let startX = 0, startY = 0;
let lastTranslateX = 0, lastTranslateY = 0;
let isPinching = false;

// 이미지 확대 열기 (외부 호출용)
function openZoom(src) {
    const modal = document.getElementById('imgModal');
    const img = document.getElementById('modalImg');
    if (!modal || !img) return;

    img.src = src;
    // 초기화
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    lastTranslateX = 0;
    lastTranslateY = 0;
    img.style.transform = `translate(0px, 0px) scale(1)`;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 이미지 확대 닫기
function closeZoom() {
    const modal = document.getElementById('imgModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 터치 이벤트 초기화 (스크립트 로드 시 즉시 실행)
(function initZoomEvents() {
    window.addEventListener('load', () => {
        const modal = document.getElementById('imgModal');
        const modalImg = document.getElementById('modalImg');
        if (!modal || !modalImg) return;

        // 배경 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'imgModal') closeZoom();
        });

        function applyTransform() {
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            
            // 이미지가 화면에 보여진 후의 실제 크기 기반 계산
            const scaledW = modalImg.offsetWidth * currentScale;
            const scaledH = modalImg.offsetHeight * currentScale;

            const maxX = Math.max(0, (scaledW - screenW) / 2);
            const maxY = Math.max(0, (scaledH - screenH) / 2);

            translateX = Math.min(maxX, Math.max(-maxX, translateX));
            translateY = Math.min(maxY, Math.max(-maxY, translateY));
            
            modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
        }

        modal.addEventListener('touchstart', e => {
            if (e.touches.length === 2) {
                isPinching = true;
                startDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                startScale = currentScale;
            } else if (e.touches.length === 1) {
                startX = e.touches[0].clientX - lastTranslateX;
                startY = e.touches[0].clientY - lastTranslateY;
            }
        }, { passive: true });

        modal.addEventListener('touchmove', e => {
            if (!modal.classList.contains('active')) return;
            
            if (e.touches.length === 2) {
                e.preventDefault(); // 핀치 줌 중 스크롤 방지
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                currentScale = Math.min(Math.max(startScale * (dist / startDist), 1), 5);
                applyTransform();
            } else if (e.touches.length === 1 && !isPinching) {
                if (currentScale > 1) {
                    e.preventDefault(); // 확대된 상태에서만 드래그 시 스크롤 방지
                    translateX = e.touches[0].clientX - startX;
                    translateY = e.touches[0].clientY - startY;
                    applyTransform();
                }
            }
        }, { passive: false });

        modal.addEventListener('touchend', e => {
            if (e.touches.length < 2) {
                isPinching = false;
                lastTranslateX = translateX;
                lastTranslateY = translateY;
            }
        }, { passive: true });
    });
})();

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
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
        <button onclick="renderLocation('others', this)">기타</button>
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

    // 갤러리 섹션 구성
    let galleryHtml = "";
    if (item.gallery && item.gallery.length > 0) {
        galleryHtml = `<div class="rich-gallery">` + item.gallery.map(g => {
            // 지도(isMap)이거나, 제목과 설명이 모두 없는 경우 100% 너비로 출력
            const isFullWidth = g.isMap || (!g.title && !g.desc);
            
            if (isFullWidth) {
                return `
                <div class="rich-item rich-item-full">
                    ${g.title ? `<div class="rich-item-title">${g.title}</div>` : ''}
                    <div class="rich-img-box" onclick="openZoom('${g.src}')">
                        <img src="${g.src}" class="rich-img-thumb">
                        <div class="zoom-tag-map">${g.isMap ? '🔍 지도 확대보기' : '🔍 확대보기'}</div>
                    </div>
                    ${g.desc ? `<div class="rich-item-desc">${g.desc.split('\n').map(p => `<p>${p}</p>`).join('')}</div>` : ''}
                </div>`;
            } else {
                // 설명이 있는 경우 제목을 상단에 두고 이미지를 좌측 float 처리
                return `
                <div class="rich-item rich-item-side">
                    ${g.title ? `<div class="rich-item-title">${g.title}</div>` : ''}
                    <div class="rich-img-box" onclick="openZoom('${g.src}')">
                        <img src="${g.src}" class="rich-img-thumb">
                        <div class="zoom-tag-normal">🔍</div>
                    </div>
                    <div class="rich-item-desc">
                        ${g.desc ? g.desc.split('\n').map(p => `<p>${p}</p>`).join('') : ''}
                    </div>
                    <div style="clear:both;"></div>
                </div>`;
            }
        }).join('') + `</div>`;
    }

    // 운영시간 및 공통 설명 HTML 구성
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
            <div onclick="copy('${escAttr(item.cn)}', event)">
                <div class="kr-med">${item.kr}</div>
                <div class="cn-big">${item.cn}</div>
            </div>
            <span class="label-small">주소</span>
            <div class="content-text" onclick="copy('${escAttr(item.addr)}')">${item.addr}</div>
            <span class="label-small">지하철</span>
            <div class="subway-line" onclick="copy('${escAttr(cnPart)}')">
                <span class="cn-sub">${cnPart}</span><span class="kr-sub">${krPart}</span>
                <div class="subway-tags">${lineTags}</div>
            </div>
            ${hoursHtml}
            ${descHtml}
            ${galleryHtml}
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
    const names = window.resNameData || {};
    document.getElementById('menu-depth2').innerHTML = resKeys.map(res => `
        <button onclick="loadMenu('${res}', this)">${names[res] || res}</button>
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
        <div class="menu-card" onclick="copy('${escAttr(i.cn)}', event)">
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
            calcExpr = String(safeCalc(calcExpr));
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
        resultNum = safeCalc(calcExpr) || 0;
    } catch {
        resultNum = 0;
    }

    cnyElement.innerText = calcExpr + " CNY";
    krwElement.innerHTML = Math.round(resultNum * currentRate).toLocaleString() + "<span>원</span>";
}

// 사칙연산만 허용하는 안전한 계산기 (eval 대체)
function safeCalc(expr) {
    const clean = expr.replace(/×/g, '*').replace(/÷/g, '/');
    if (!/^[0-9+\-*/.() ]+$/.test(clean)) throw new Error("잘못된 입력");
    return Function('"use strict"; return (' + clean + ')')();
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

// 회화 카테고리 렌더링 (복사 삭제, 강조 기능 추가)
function renderTalkCategory(cat, btn) {
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const items = window.talkData[cat] || [];
    document.getElementById('app').innerHTML = `
        <div style="padding:10px 5px;" id="talk-list">
            ${items.map((t, idx) => `
                <div class="talk-item" onclick="toggleTalkHighlight(this, '${escAttr(t.cn)}')">
                    <div style="flex:1">
                        <div class="talk-cn">${t.cn}</div>
                        <div class="talk-py-read">${t.py} / ${t.kr_read}</div>
                        <div class="talk-kr-desc">${t.kr}</div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    window.scrollTo(0, 0);
}

// 회화 강조 토글 및 자동 복사 함수
function toggleTalkHighlight(el, text) {
    const isAlreadyActive = el.classList.contains('active');
    
    // 1. 일단 모든 강조 해제
    document.querySelectorAll('.talk-item').forEach(item => {
        item.classList.remove('active');
    });

    // 2. 이미 강조된 걸 누른 게 아니라면 강조 후 복사 실행
    if (!isAlreadyActive) {
        el.classList.add('active');
        if (text) {
            // 강조와 동시에 클립보드 복사 실행
            navigator.clipboard.writeText(text).then(() => {
                showToast("복사됨: " + text);
            });
        }
    }
}

// ==========================================
// [탭 5: 정보 (멤버/일정) 관련] - 3뎁스 구조 개편
// ==========================================

function showInfoTab(btn) {
    // 3뎁스(날짜 바)가 보여야 하므로 'all' 모드로 시작
    setAppLayout('all'); 
    setActiveFooter(btn);

    document.getElementById('menu-depth2').innerHTML = `
        <button onclick="renderInfoScheduleTab(this)">여행 일정</button>
        <button onclick="renderInfoMembers(this)">일행 정보</button>
    `;
    
    // 여행 일정이 기본으로 로드됨
    renderInfoScheduleTab(document.querySelector('#menu-depth2 button'));
}

// 5-1. 일행 정보 화면 (2뎁스 유지)
function renderInfoMembers(btn) {
    // 탭 이동 시 3뎁스(날짜 바)를 확실히 숨김
    setAppLayout('mid'); 
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    
    // 안전한 클래스 추가
    if (btn) btn.classList.add('active');

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
    setAppLayout('all');
    document.querySelectorAll('#menu-depth2 button').forEach(b => b.classList.remove('active'));
    
    // 안전한 클래스 추가
    if (btn) btn.classList.add('active');

    const sch = window.scheduleData || {};
    const days = Object.keys(sch);

    document.getElementById('menu-depth3').innerHTML = days.map((day, idx) => `
        <button onclick="renderDaySchedule('${day}', this)">${day}</button>
    `).join('');

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
            <input type="text" id="${id}" value="${escAttr(val).replace(/&quot;/g, '"')}" ${onInput} onchange="saveMem(${idx})" placeholder="${ph}">
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
