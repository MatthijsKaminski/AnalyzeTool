function toggle() {

    if( document.getElementById("sidebar1").className.indexOf("folded") > -1)
    {
        document.getElementById("sidebar1").className = document.getElementById("sidebar1").className.replace ( "folded" , 'expanded' );
        document.getElementById("wrapper").className = document.getElementById("wrapper").className.replace ( "wrapper-normal" , 'wrapper-adjust' );
    }
    else
    {
        document.getElementById("sidebar1").className = document.getElementById("sidebar1").className.replace ( "expanded" , 'folded' );
        document.getElementById("wrapper").className = document.getElementById("wrapper").className.replace ( "wrapper-adjust" , 'wrapper-normal' );

    }

}