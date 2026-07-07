// 복사 및 지하철 추출 로직
function copy(text) { 
    navigator.clipboard.writeText(text); 
    alert("복사: " + text); 
}

function getCnSub(text) { 
    const m = text.match(/\((.*?)\)/); 
    return m ? m[1] : text; 
}

// 1. 위치 탭 클릭 시 서브 메뉴 생성
function showSub(type) {
    const sub = document.getElementById('sub-menu');
    document.getElementById('app').innerHTML = ''; 

    if(type === 'location') {
        sub.innerHTML = `
            <button onclick="render('hotel')">호텔</button>
            <button onclick="render('tour')">관광지</button>
            <button onclick="render('restaurant')">식당</button>
        `;
    }
}

// 2. 2차 탭 클릭 시 데이터 렌더링
function render(cat) {
    // 윈도우 객체에서 데이터 변수를 안전하게 찾음
    const dataMap = { 
        'hotel': window.hotelData, 
        'tour': window.tourData, 
        'restaurant': window.restaurantData 
    };
    
    const list = dataMap[cat];
    
    if (!list) {
        console.error(cat + " 데이터를 찾을 수 없습니다. 파일 로드 상태를 확인하세요.");
        alert("데이터를 불러오지 못했습니다.");
        return;
    }

    const app = document.getElementById('app');
    app.style.display = 'flex';
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
