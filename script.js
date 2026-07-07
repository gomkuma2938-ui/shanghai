function copy(text) { navigator.clipboard.writeText(text); alert("복사 완료: " + text); }
function getCnSub(text) { const m = text.match(/\((.*?)\)/); return m ? m[1] : text; }
function formatSubway(text) {
    const lineMatch = text.match(/(\d+)호선/);
    if (!lineMatch) return text;
    const lineNum = lineMatch[1];
    const stationName = text.split(' ')[0];
    return `<div style="display: flex; align-items: center; gap: 5px;"><span class="subway-tag line-${lineNum}">${lineNum}</span><span>${stationName}</span></div>`;
}

// 1차 탭: 하단 메뉴
function showSub(type, btnElement) {
    document.querySelectorAll('.footer button').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    const sub = document.getElementById('sub-menu');
    if(type === 'location') {
        sub.innerHTML = `
            <button onclick="renderList('hotel', this)">호텔</button>
            <button onclick="renderList('tour', this)">관광지</button>
            <button onclick="renderList('restaurant', this)">식당</button>
        `;
        renderList('hotel', sub.querySelector('button:first-child'));
    }
}

// 2차 탭: 상단 메뉴 (카테고리 내 장소 목록)
function renderList(cat, btnElement) {
    document.querySelectorAll('#sub-menu button').forEach(btn => btn.classList.remove('active'));
    // 만약 1차 메뉴 버튼이 아닌 2차 메뉴 버튼이면 active 추가
    if(btnElement) btnElement.classList.add('active');

    const list = window[cat + 'Data'];
    const sub = document.getElementById('sub-menu');
    
    // 카테고리 버튼들을 다시 그려줌 (활성화 상태 유지)
    sub.innerHTML = `
        <button class="${cat==='hotel'?'active':''}" onclick="renderList('hotel', this)">호텔</button>
        <button class="${cat==='tour'?'active':''}" onclick="renderList('tour', this)">관광지</button>
        <button class="${cat==='restaurant'?'active':''}" onclick="renderList('restaurant', this)">식당</button>
        <hr>
    ` + list.map((item, index) => `
        <button onclick="renderCard('${cat}', ${index}, this)">${item.kr}</button>
    `).join('');

    renderCard(cat, 0, sub.querySelectorAll('button')[3]); // 장소목록의 첫번째 자동 선택
}

// 카드 출력
function renderCard(cat, index, btnElement) {
    document.querySelectorAll('#sub-menu button').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    const item = window[cat + 'Data'][index];
    document.getElementById('app').innerHTML = `
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

// 시작하자마자 첫 번째 탭 자동 클릭
window.onload = () => {
    document.querySelector('.footer button').click();
};
