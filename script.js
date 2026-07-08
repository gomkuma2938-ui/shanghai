const resName = {
    jiajia: '지아지아탕바오',
    dahuchun: '다후춘',
    haidilao: '하이디라오',
    jiangbian: '강변성외'
};

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
        const firstLine = lines[0]; // 제목(첫 줄)
        const remainingText = lines.slice(1).join('\n').trim(); // 나머지 본문
        
        // 온점이 아니라 실제 줄바꿈(\n)을 기준으로 문단을 나눔
        const bodyHtml = remainingText.split('\n').map(p => {
            if (!p.trim()) return '';
            return `<p class="desc-para">${p.trim()}</p>`; 
        }).join('');
        
        descHtml = `
            <div class="desc">
                <div class="desc-header">${firstLine}</div>
                <div class="desc-body">${bodyHtml}</div>
            </div>`;
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

function showMenuTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (!window.menuData) { alert("menu_data.js 파일을 찾을 수 없거나 데이터가 비어있습니다."); return; }
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

// --- 계산기 관련 로직 ---
let calcExpr = "0"; 
let currentRate = localStorage.getItem('exchangeRate') || 223.0;

function showCalcTab(btn) {
    document.querySelectorAll('.footer button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // 상단 메뉴바 숨기기
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
        </div>
    `;
    updateCalcDisplay();
}

function pressCalc(key) {
    if (key === 'AC') {
        calcExpr = "0";
    } else if (key === 'DEL') {
        calcExpr = calcExpr.length > 1 ? calcExpr.slice(0, -1) : "0";
    } else if (key === '=') {
        try {
            calcExpr = String(eval(calcExpr));
        } catch {
            calcExpr = "Error";
        }
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
        resultNum = eval(calcExpr) || 0;
    } catch {
        resultNum = 0;
    }

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
