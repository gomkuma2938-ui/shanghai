// 복사 및 유틸 함수
function copy(text) { navigator.clipboard.writeText(text); alert("복사: " + text); }
function getCnSub(text) { const m = text.match(/\((.*?)\)/); return m ? m[1] : text; }
function formatSubway(text) {
    const lineMatch = text.match(/(\d+)호선/);
    if (!lineMatch) return text;
    const lineNum = lineMatch[1];
    const stationName = text.split(' ')[0];
    return `<div style="display: flex; align-items: center; gap: 5px;"><span class="subway-tag line-${lineNum}">${lineNum}</span><span>${stationName}</span></div>`;
}

// 1차 탭 클릭 시 2차 탭 생성
function showSub(type, btnElement) {
    document.querySelectorAll('.footer button').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    const sub = document.getElementById('sub-menu');
    const catData = window[type + 'Data'];
    
    sub.innerHTML = catData.map((item, index) => `
        <button onclick="renderCard('${type}', ${index}, this)">${item.kr}</button>
    `).join('');

    renderCard(type, 0, sub.querySelector('button'));
}

// 2차 탭 선택 시 카드 출력
function renderCard(cat, index, btnElement) {
    const buttons = document.querySelectorAll('#sub-menu button');
    buttons.forEach(btn => btn.classList.remove('active'));
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

// 시작하자마자 호텔 탭 자동 실행
window.onload = () => {
    showSub('hotel', document.querySelector('.footer button:nth-child(1)'));
};
