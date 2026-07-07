/* script.js */

// 각 탭별 설정 및 데이터 매핑
const CONFIG = {
    hotel: { data: hotelData, title: '숙소' },
    tour: { data: tourData, title: '관광지' },
    restaurant: { data: restaurantData, title: '식당' },
    menu: { data: menuData, title: '메뉴' }, // 나중에 추가될 데이터
    conversation: { data: convData, title: '회화' } // 나중에 추가될 데이터
};

function render(type) {
    const config = CONFIG[type];
    if (!config) return;

    const app = document.getElementById('app');
    
    // UI 업데이트
    document.querySelectorAll('.footer button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + type).classList.add('active');

    // 카드 생성
    app.innerHTML = `<h2>${config.title}</h2>` + config.data.map(i => `
        <div class="card">
            ${generateCardContent(i)}
        </div>
    `).join('');
}

// 템플릿 생성 로직을 분리 (나중에 메뉴/회화 템플릿도 여기서 구분 가능)
function generateCardContent(item) {
    if (item.menu) { /* 메뉴용 템플릿 */ }
    if (item.phrase) { /* 회화용 템플릿 */ }
    
    // 기본 위치 정보 템플릿
    return `
        <div class="label">명칭</div>
        <div class="data" onclick="copy('${item.cn}')">${item.kr}<br><small style="color:blue">${item.cn}</small></div>
        <div class="label">주소</div>
        <div class="data" onclick="copy('${item.addr}')">${item.addr}</div>
        <div class="label">지하철역 (중국어 복사)</div>
        <div class="data" onclick="copy('${getCnSub(item.sub)}')">${item.sub}</div>
    `;
}
