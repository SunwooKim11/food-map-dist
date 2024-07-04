document.addEventListener("DOMContentLoaded", function () {
  var mapContainer = document.getElementById("map"), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(37.5665, 126.978), // 지도의 중심좌표
      level: 8, // 지도의 확대 레벨
    };

  // 지도를 생성합니다
  var map = new kakao.maps.Map(mapContainer, mapOption);
  // 1. 지도에 확대 축소 컨트롤 추가

  // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
  var zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  // 2. 더미데이터 준비하기 (제목, 주소, url, 카테고리)

  const dataSet = [
    {
      title: "희락돈까스",
      address: "서울 영등포구 양산로 210",
      url: "https://www.youtube.com/watch?v=1YOJbOUR4vw&t=88s",
      category: "양식",
    },
    {
      title: "즉석우동짜장",
      address: "서울 영등포구 대방천로 260",
      url: "https://www.youtube.com/watch?v=wH_YobGZKFk",
      category: "한식",
    },
    {
      title: "아카사카",
      address: "서울 서초구 서초대로74길 23",
      url: "https://www.youtube.com/watch?v=vNxQU8AdqzE",
      category: "일식",
    },
  ];

  // 3. 지도에 마커를 표시하기
  var geocoder = new kakao.maps.services.Geocoder();

  function getContent(data) {
    let replaceUrl = data.url;
    let finUrl = "";
    replaceUrl = replaceUrl.replace("https://youtu.be/", "");
    replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", "");
    replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", "");
    finUrl = replaceUrl.split("&")[0];
    imgSrc = `https://img.youtube.com/vi/${finUrl}/mqdefault.jpg`;
    return `<div class="infowindow">
        <div class="infowindow-img-container">
            <img src=${imgSrc} />
        </div>
        <div class="infowindow-body">
            <h5 class="infowindow-title">${data.title}</h5>
            <p class="infowindow-address">${data.address}</p>
            <a href="${data.url}" class="infowindow-btn">이동</a>
        </div>
    </div>`;
  }
  // geocoder.addressSearch를 Promise로 래핑하는 함수
  async function getCoordByAddress(address) {
    try {
      const result = await new Promise((resolve, reject) => {
        geocoder.addressSearch(address, function (result, status) {
          if (status === kakao.maps.services.Status.OK) {
            resolve(result);
          } else {
            reject(new Error("error: not valid address " + status));
          }
        });
      });
      return new kakao.maps.LatLng(result[0].y, result[0].x);
    } catch (error) {
      console.error(error);
    }
  }

  setMap = async (dataSet) => {
    // dataSet을 back에서 받아오기.
    for (i = 0; i < dataSet.length; i++) {
      let coords = await getCoordByAddress(dataSet[i].address);
      // 결과값으로 받은 위치를 마커로 표시합니다
      let marker = new kakao.maps.Marker({
        map: map,
        position: coords,
      });
      markerArray.push(marker);
      // **********************************************************
      //   4. 마커에 인포윈도우를 표시하기
      // **********************************************************
      let infowindow = new kakao.maps.InfoWindow({
        content: getContent(dataSet[i]), // 인포윈도우에 표시할 내용
      });
      infowindowArray.push(infowindow);

      // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
      // 이벤트 리스너로는 클로저를 만들어 등록합니다
      // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
      kakao.maps.event.addListener(
        marker,
        "click",
        makeOverListener(map, marker, infowindow, coords)
      );
      kakao.maps.event.addListener(map, "click", makeOutListener(infowindow));
    }
  };

  // 인포윈도우를 표시하는 클로저를 만드는 함수입니다
  function makeOverListener(map, marker, infowindow, coords) {
    return function () {
      closeAllInfoWindows();
      infowindow.open(map, marker);
      map.panTo(coords);
    };
  }

  let infowindowArray = [];
  function closeAllInfoWindows() {
    for (let i = 0; i < infowindowArray.length; i++) {
      infowindowArray[i].close();
    }
  }
  // 인포윈도우를 닫는 클로저를 만드는 함수입니다
  function makeOutListener(infowindow) {
    return function () {
      infowindow.close();
    };
  }

  setMap(dataSet);
  categoryMap = {
    korea: "한식",
    china: "중식",
    japan: "일식",
    america: "양식",
    wheat: "분식",
    meet: "구이",
    sushi: "회/초밥",
    etc: "기타",
  };
  //' 5. 카테고리별로 마커를 필터링하기
  const categoryList = document.querySelector(".category-list");
  categoryList.addEventListener("click", categoryHandler);

  function categoryHandler(e) {
    const categoryId = e.target.id;

    // get query로 back에서 받아오자.
    const filteredData = dataSet.filter(
      (data) => data.category === categoryMap[categoryId]
    );
    console.log(categoryId, filteredData);
    // 기존 마커 삭제
    closeMaker();

    // 기존 infoWindow 삭제
    closeAllInfoWindows();
    setMap(filteredData);
  }

  let markerArray = [];
  function closeMaker() {
    for (let i = 0; i < markerArray.length; i++) {
      markerArray[i].setMap(null);
    }
  }
});

