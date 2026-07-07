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
    let list = (cat === 'hotel') ? hotelData : (cat === 'tour') ? tourData : restaurantData;
    document.getElementById('app').innerHTML = list.map(i => `
        <div class="card">
            <div class="label">명칭</div>
            <div class="data" onclick="copy('${i.cn}')">${i.kr}<br><small style="color:blue">${i.cn}</small></div>
            <div class="label">주소</div>
            <div class="data" onclick="copy('${i.addr}')">${i.addr}</div>
            <div class="label">지하철역 (클릭 시 중국어 복사)</div>
            <div class="data" onclick="copy('${getCnSub(i.sub)}')">${i.sub}</div>
        </div>
    `).join('');
}
