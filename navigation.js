import { routes } from './routes.js' ;

var startMarker, endMarker;
var distance = 0 ; var content = '' ;
var start , end ;
var distanceOverlay;

// 마우스 우클릭 하여 선 그리기가 종료됐을 때 호출하여 
// 그려진 선의 총거리 정보와 거리에 대한 도보, 자전거 시간을 계산하여
// HTML Content를 만들어 리턴하는 함수입니다

function getTimeHTML(distance) {
    // 도보의 시속은 평균 4km/h 이고 도보의 분속은 67m/min입니다
    //console.log("distnce", distance);

    var walkkTime = distance / 67 | 0;
    var walkHour = '', walkMin = '';
        walkMin = '<span class="number">' + walkkTime % 60 + '</span>분'

    // 계산한 도보 시간이 60분 보다 크면 시간으로 표시합니다
    if (walkkTime > 60) {
        walkHour = '<span class="number">' + Math.floor(walkkTime / 60) + '</span>시간 '
    }

    // 거리와 도보 시간 가지고 HTML Content를 만들어 리턴합니다
    content = '<ul class="dotOverlay distanceInfo">';
    content += '    <li>';
    content += '        <span class="label">총거리</span><span class="number">' + distance + '</span>m';
    content += '    </li>';
    content += '    <li>';
    content += '        <span class="label">도보</span>' + walkHour + walkMin;
    content += '    </li>';
    content += '</ul>'

    return content;
}

export function drawPath(startPlace, endPlace, routes, map, polyline) {
 
    // 출발지와 목적지가 같으면 경고창을 띄운다.
    if ( startPlace == endPlace ) {
        alert("출발지와 목적지가 같습니다.");
        return ;
    }

    // 출발지가 routes에 없으면 출발지와 도착지를 바꾼다.
    // 출발지 지점에 최종 도보거리와 시간을 표시한다.
  
    var revearse = false ;
    if ( !routes[startPlace] || !routes[startPlace][endPlace] ) {
        revearse = true ;
        var temp = startPlace;
        startPlace = endPlace;
        endPlace = temp;
    }
 
    if (routes[startPlace] && routes[startPlace][endPlace]) {
        var path = routes[startPlace][endPlace].map(function(coord) {
            return new kakao.maps.LatLng(coord.lat, coord.lng);
        });

        if (polyline) {
            polyline.setMap(null);
        }
        if ( startMarker) {
            startMarker.setMap(null);
        }
        if ( endMarker) {
            endMarker.setMap(null);
        }
        if ( distanceOverlay ) {
            distanceOverlay.setMap(null);
        }   
        // 출발지와 목적지에 마커를 그려준다
        if ( revearse == false ) { 
            start = path[0];
            end = path[path.length - 1];
        }
        else {
            start = path[path.length - 1];
            end = path[0];
        }
        startMarker = new kakao.maps.Marker({
            map: map,
            position: start,
            title: "출발"
        });
    
        endMarker = new kakao.maps.Marker({
            map: map,
            position: end,        
            title: "도착"
        }); 
        
        // 지도에 그려진 선을 표시하기 위한 폴리라인을 생성합니다
        polyline.setPath(path);
        polyline.setMap(map);
        
        distance = Math.round(polyline.getLength()) ;  // 구한 거리(m)
        content = getTimeHTML(distance); // 구해진 거리를 가지고 도보시간을 가져옵니다.
    
        distanceOverlay = new kakao.maps.CustomOverlay({
            content: content,    
            position: end, 
            xAnchor: 0.5,
            yAnchor: 0,
            zIndex: 3  
        });
        
        distanceOverlay.setMap(map);

        var bounds = new kakao.maps.LatLngBounds();
        for (var i = 0; i < path.length; i++) {
            bounds.extend(path[i]);
        }
        map.setBounds(bounds);
    }
    else {
        alert("해당 경로 정보가 없습니다.");
    }
}

export default { drawPath } ;