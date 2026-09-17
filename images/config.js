/* 실제 글 주소로 설정하세요. 예시 데이터는 preview에만 들어갑니다.
   시리즈 항목: {id:'network', title:'네트워크 다시 읽기', url:'/category/CS',
     posts:[{url:'/1',title:'TCP 혼잡 제어',minutes:8,badge:'네트워크 04'}, ...]}
   posts 배열 순서가 시리즈 읽기 순서입니다. 완료 수는 방문자의 실제 읽기 기록으로 계산합니다.
   글별 추가 정보: posts: {'/1':{minutes:8,badge:'네트워크 04'}}
   검색과 목록은 티스토리 데이터를 사용하므로 여기에 모든 글을 입력할 필요는 없습니다. */
window.RECORD_CONFIG = {
  series: [],
  posts: {},
  // 제목 수가 카테고리에 표시되지 않는 경우에만 실제 전체 글 수를 입력하세요.
  totalPosts: null
};
