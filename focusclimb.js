
function copyToClipboard(txt) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(txt).select();
    document.execCommand("copy");
    $temp.remove();
}


        $("#menu-bar a").click(function(){
          var id = $(this).attr("href").substring(1);
          $("html, body").animate({ scrollTop: $("#"+id).offset().top }, 1000, function(){
            $("#menu-bar").slideReveal("hide");
          });
        });

        var slider = $("#menu-bar").slideReveal({
          // width: 100,
          push: false,
          position: "right",
          // speed: 600,
          trigger: $(".handle"),
          // autoEscape: false,
          shown: function(obj){
            obj.find(".handle").html('>>');
            obj.addClass("left-shadow-overlay");
          },
          hidden: function(obj){
            obj.find(".handle").html('<<');
            obj.removeClass("left-shadow-overlay");
          }
        });

                var number = 1 + Math.floor(Math.random() * 100);
                $.getJSON({
  url: "https://api.pexels.com/v1/search",
  headers: {
    'Authorization': '563492ad6f917000010000010b883213d49b45daaa804a8854ad452c'
  },
  data: {
    query: "4k nature",
    orientation: "landscape",
    size: "large",
    per_page: 1,
    page: number
  },
  success: function( result ) {
          var bg = result['photos'][0]['src']['large2x'];
          console.log(bg);
           $("body").css("background-image", "url('" + bg + "')");
           //copyToClipboard(bg);
  }
});
