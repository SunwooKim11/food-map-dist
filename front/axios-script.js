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

  async function getDataSet(query) {
    if (!query) {
      query = "";
    }
    const dataSet = await axios({
      method: "get",
      url: `http://3.34.226.149:3000/restaurants?category=${query}`,
      headers: {}, // packet header
      data: {}, // packet body
    })
      .then((res) => {
        console.log(res);
        return res.data.result;
      })
      .catch((err) => {
        console.log(err);
      });
    return dataSet;
  }

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

  async function categoryHandler(e) {
    const categoryId = e.target.id;

    // get query로 back에서 받아오자.
    const filteredData = await getDataSet(categoryMap[categoryId]);

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
  async function setting() {
    try {
      const dataSet = await getDataSet();
      setMap(dataSet);
    } catch (error) {
      console.error(error);
    }
  }
  setting();
});
