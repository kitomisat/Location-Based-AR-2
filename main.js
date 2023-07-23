/* ARの名称・緯度・経度 */
tour_list = [
  {
    "name": "学校", // 星ヶ丘駅
    "lat": 35.1597448407689,
    "lon": 136.98730438459847,
    "distance": 0,
    "visible": false,
  },
  {
    "name": "Library", // 図書館
    "lat": , 
    "lon": , 
    "distance": 0,
    "visible": false,
  },
  {
    "name": "Zoo", // 東山動植物園
    "lat": , 
    "lon": ,
    "distance": 0,
    "visible": false,
  },
  {
    "name": "Tech Land", // ヤマダ電機
    "lat": , 
    "lon": ,
    "distance": 0,
    "visible": false,
  }, 
]

const app = Vue.createApp({
  data(){
    return{
      gps_lat: 0, // 現在地の緯度
      gps_lon: 0, // 現在地の経度
      gps_altitude: 0, // 現在地の標高
      min_distance: 5, // 最小距離
      max_distance: 100, // 最大距離      
      tour_list: tour_list,
      map: null,
      marker: null,
      zoom: 18,
    }
  },
  methods:{
    /* 更新ボタンの処理 */
    update(){
      /* 現在地の緯度・経度の取得 */
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.gps_lat = position.coords.latitude;
          this.gps_lon = position.coords.longitude;
          this.gps_altitude = position.coords.altitude;
          console.log(`${this.gps_lat} ${this.gps_lon} ${this.gps_altitude}`)
          
          /* ARの距離を再計算 */
          for(let tour of this.tour_list){
            tour.distance = this.distance(tour.lat, tour.lon, this.gps_lat, this.gps_lon);
            console.log(tour.distance);
            
            /* 5m以上，100m以下の範囲で可視化 */
            if((tour.distance >= this.min_distance) && (tour.distance <= this.max_distance)){
              tour.visible = true;
            }
            else{
              tour.visible = false;
            }
          }
          
          /* 地図の位置更新 */
          this.map.setView([this.gps_lat, this.gps_lon], this.zoom);
          this.marker.setLatLng(L.latLng(this.gps_lat, this.gps_lon));
        }
      );  
    },
    /* 距離の計算 */
    distance(lat1, lon1, lat2, lon2){
      const R = Math.PI / 180;
      lat1 *= R;
      lon1 *= R;
      lat2 *= R;
      lon2 *= R;
      distance = 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1) + Math.sin(lat1) * Math.sin(lat2)) * 1000;
      distance = Math.round(distance, 0);
      return distance;
    },
    /* 地図の表示 */
    showMap(){      
      this.$refs.map_dialog.showModal();
      if(this.map == null){
        this.map = L.map("map", {
          attributionControl: false,
          zoomControl: false,
        })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);   
        
        /* 現在地 */
        this.marker = L.marker(L.latLng(this.gps_lat, this.gps_lon)).addTo(this.map);
        
        /* 目的地 */
        for(let tour of this.tour_list){
          L.marker(L.latLng(tour.lat, tour.lon), {
            icon: L.spriteIcon('green'),
          }).addTo(this.map);
        }
      }
      this.map.setView(L.latLng(this.gps_lat, this.gps_lon), this.zoom);
      this.marker.setLatLng(L.latLng(this.gps_lat, this.gps_lon));
      console.log(this.gps_lat, this.gps_lon);
    },
    /* 地図の非表示 */
    closeMap(){
      this.$refs.map_dialog.close();
    },
    /* 現在地に戻る */
    goGPS(){
      this.map.setView(L.latLng(this.gps_lat, this.gps_lon), this.zoom);
    }
  },
  mounted: function(){
    /* ダイアログの表示 */
    this.$refs.gps_dialog.showModal();
    
    /* 更新 */
    this.update();
    
    /* 自動更新 */
    setInterval(this.update, 1000);
    
  },
});
                          
app.mount("#app");
