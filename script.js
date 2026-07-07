// 4. 위치 탭 서브 메뉴 생성
function showSub(type) {
    const sub = document.getElementById('sub-menu');
    const app = document.getElementById('app');
    app.innerHTML = ''; 
    app.className = '';

    if(type === 'location') {
        sub.innerHTML = `
            <button onclick="renderList('hotel')">호텔</button>
            <button onclick="renderList('tour')">관광지</button>
            <button onclick="renderList('restaurant')">식당</button>
        `;
    }
}

// 5. [서브 메뉴] 클릭 시 해당 카테고리의 이름들(가로 스크롤)을 렌더링
function renderList(cat) {
    const list = window[cat + 'Data'];
    const sub = document.getElementById('sub-menu');
    const app = document.getElementById('app');
    
    app.innerHTML = ''; // 기존 카드 초기화

    // 서브 메뉴 아래에 장소 이름 버튼들 생성
    sub.innerHTML = list.map((item, index) => `
        <button onclick="renderCard('${cat}', ${index})">${item.kr}</button>
    `).join('');
}

// 6. [장소 이름] 클릭 시 특정 장소 카드만 렌더링
function renderCard(cat, index) {
    const item = window[cat + 'Data'][index];
    const app = document.getElementById('app');
    
    app.className = ''; // 클래스 초기화
    app.innerHTML = `
        <div class="card">
            <div class="label">명칭</div>
            <div class="kr-text" onclick="copy('${item.cn}')">${item.kr}</div>
            <div class="cn-text" onclick="copy('${item.cn}')">${item.cn}</div>
            
            <div class="label">주소</div>
            <div class="data" onclick="copy('${item.addr}')">${item.addr}</div>
            
            <div class="label">지하철역</div>
            <div class="data" onclick="copy('${getCnSub(item.sub)}')">${formatSubway(item.sub)}</div>
        </div>
    `;
}
