function copy(text) { 
    navigator.clipboard.writeText(text); 
    alert("복사: " + text); 
}

function getCnSub(text) { 
    const m = text.match(/\((.*?)\)/); 
    return m ? m[1] : text; 
}

function showSub(type) {
    const sub = document.getElementById('sub-menu');
    if(type === 'location') {
        sub.innerHTML = `
            <button onclick="render('hotel')">호텔</button>
            <button onclick="render('tour')">관광지</button>
            <button onclick="render('restaurant')">식당</button>
        `;
    }
}

function render(cat) {
    const dataMap = { 'hotel': hotelData, 'tour': tourData, 'restaurant': restaurantData };
    const list = dataMap[cat];
    
    const app = document.getElementById('app');
    // 관광지일 경우 슬라이드 모드 적용
    app.style.flexDirection = (cat === 'tour') ? 'row' : 'column';
    app.style.overflowX = (cat === 'tour') ? 'auto' : 'visible';

    app.innerHTML = list.map(i => `
        <div class="card ${cat === 'tour' ? 'tour-mode' : ''}">
            <div class="label">명칭</div>
            <div class="kr-text" onclick="copy('${i.cn}')">${i.kr}</div>
            <div class="cn-text" onclick="copy('${i.cn}')">${i.cn}</div>
            
            <div class="label">주소</div>
            <div class="data" onclick="copy('${i.addr}')">${i.addr}</div>
            
            <div class="label">지하철역</div>
            <div class="data" onclick="copy('${getCnSub(i.sub)}')">${i.sub}</div>
        </div>
    `).join('');
}
