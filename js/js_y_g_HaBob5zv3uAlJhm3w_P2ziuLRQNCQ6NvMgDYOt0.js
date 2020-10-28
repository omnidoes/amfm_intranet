/* global a2a*/
(function (Drupal) {
  'use strict';

  Drupal.behaviors.addToAny = {
    attach: function (context, settings) {
      // If not the full document (it's probably AJAX), and window.a2a exists
      if (context !== document && window.a2a) {
        a2a.init_all(); // Init all uninitiated AddToAny instances
      }
    }
  };

})(Drupal);
;
/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

;(function( $ ){

  'use strict';

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null,
      ignore: null
    };

    if(!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement("div");
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        'iframe[src*="player.vimeo.com"]',
        'iframe[src*="youtube.com"]',
        'iframe[src*="youtube-nocookie.com"]',
        'iframe[src*="kickstarter.com"][src*="video.html"]',
        'object',
        'embed'
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var ignoreList = '.fitvidsignore';

      if(settings.ignore) {
        ignoreList = ignoreList + ', ' + settings.ignore;
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not('object object'); // SwfObj conflict patch
      $allVideos = $allVideos.not(ignoreList); // Disable FitVids on this video.

      $allVideos.each(function(){
        var $this = $(this);
        if($this.parents(ignoreList).length > 0) {
          return; // Disable FitVids on this video.
        }
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        if ((!$this.css('height') && !$this.css('width')) && (isNaN($this.attr('height')) || isNaN($this.attr('width'))))
        {
          $this.attr('height', 9);
          $this.attr('width', 16);
        }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('name')){
          var videoName = 'fitvid' + $.fn.fitVids._count;
          $this.attr('name', videoName);
          $.fn.fitVids._count++;
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+'%');
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
  
  // Internal counter for unique video names.
  $.fn.fitVids._count = 0;
  
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );
;
(function ($, Drupal, drupalSettings) {
  // At this point 'drupalSettings' is already available.
  try
  {
    //$('body').fitVids({});
    $(drupalSettings.fitvids.selectors).fitVids({
      customSelector: drupalSettings.fitvids.custom_vendors,
      ignore: drupalSettings.fitvids.ignore_selectors
    });
  }
  catch (e) {
    // catch any fitvids errors
    window.console && console.warn('Fitvids stopped with the following exception');
    window.console && console.error(e);
  }

})(jQuery, Drupal, drupalSettings);
;
/**
 * @file
 * Attaches several event listener to a web page.
 */

(function ($, Drupal, drupalSettings) {

  /* eslint max-nested-callbacks: ["error", 4] */

  'use strict';

  Drupal.google_analytics = {};

  $(document).ready(function () {

    // Attach mousedown, keyup, touchstart events to document only and catch
    // clicks on all elements.
    $(document.body).on('mousedown keyup touchstart', function (event) {

      // Catch the closest surrounding link of a clicked element.
      $(event.target).closest('a,area').each(function () {

        // Is the clicked URL internal?
        if (Drupal.google_analytics.isInternal(this.href)) {
          // Skip 'click' tracking, if custom tracking events are bound.
          if ($(this).is('.colorbox') && (drupalSettings.google_analytics.trackColorbox)) {
            // Do nothing here. The custom event will handle all tracking.
            // console.info('Click on .colorbox item has been detected.');
          }
          // Is download tracking activated and the file extension configured
          // for download tracking?
          else if (drupalSettings.google_analytics.trackDownload && Drupal.google_analytics.isDownload(this.href)) {
            // Download link clicked.
            gtag('event', Drupal.google_analytics.getDownloadExtension(this.href).toUpperCase(), {
              event_category: 'Downloads',
              event_label: Drupal.google_analytics.getPageUrl(this.href),
              transport_type: 'beacon'
            });
          }
          else if (Drupal.google_analytics.isInternalSpecial(this.href)) {
            // Keep the internal URL for Google Analytics website overlay intact.
            // @todo: May require tracking ID
            gtag('config', drupalSettings.google_analytics.account, {
              page_path: Drupal.google_analytics.getPageUrl(this.href),
              transport_type: 'beacon'
            });
          }
        }
        else {
          if (drupalSettings.google_analytics.trackMailto && $(this).is("a[href^='mailto:'],area[href^='mailto:']")) {
            // Mailto link clicked.
            gtag('event', 'Click', {
              event_category: 'Mails',
              event_label: this.href.substring(7),
              transport_type: 'beacon'
            });
          }
          else if (drupalSettings.google_analytics.trackOutbound && this.href.match(/^\w+:\/\//i)) {
            if (drupalSettings.google_analytics.trackDomainMode !== 2 || (drupalSettings.google_analytics.trackDomainMode === 2 && !Drupal.google_analytics.isCrossDomain(this.hostname, drupalSettings.google_analytics.trackCrossDomains))) {
              // External link clicked / No top-level cross domain clicked.
              gtag('event', 'Click', {
                event_category: 'Outbound links',
                event_label: this.href,
                transport_type: 'beacon'
              });
            }
          }
        }
      });
    });

    // Track hash changes as unique pageviews, if this option has been enabled.
    if (drupalSettings.google_analytics.trackUrlFragments) {
      window.onhashchange = function () {
        gtag('config', drupalSettings.google_analytics.account, {
          page_path: location.pathname + location.search + location.hash
        });
      };
    }

    // Colorbox: This event triggers when the transition has completed and the
    // newly loaded content has been revealed.
    if (drupalSettings.google_analytics.trackColorbox) {
      $(document).on('cbox_complete', function () {
        var href = $.colorbox.element().attr('href');
        if (href) {
          gtag('config', drupalSettings.google_analytics.account, {
            page_path: Drupal.google_analytics.getPageUrl(href)
          });
        }
      });
    }

  });

  /**
   * Check whether the hostname is part of the cross domains or not.
   *
   * @param {string} hostname
   *   The hostname of the clicked URL.
   * @param {array} crossDomains
   *   All cross domain hostnames as JS array.
   *
   * @return {boolean} isCrossDomain
   */
  Drupal.google_analytics.isCrossDomain = function (hostname, crossDomains) {
    return $.inArray(hostname, crossDomains) > -1 ? true : false;
  };

  /**
   * Check whether this is a download URL or not.
   *
   * @param {string} url
   *   The web url to check.
   *
   * @return {boolean} isDownload
   */
  Drupal.google_analytics.isDownload = function (url) {
    var isDownload = new RegExp('\\.(' + drupalSettings.google_analytics.trackDownloadExtensions + ')([\?#].*)?$', 'i');
    return isDownload.test(url);
  };

  /**
   * Check whether this is an absolute internal URL or not.
   *
   * @param {string} url
   *   The web url to check.
   *
   * @return {boolean} isInternal
   */
  Drupal.google_analytics.isInternal = function (url) {
    var isInternal = new RegExp('^(https?):\/\/' + window.location.host, 'i');
    return isInternal.test(url);
  };

  /**
   * Check whether this is a special URL or not.
   *
   * URL types:
   *  - gotwo.module /go/* links.
   *
   * @param {string} url
   *   The web url to check.
   *
   * @return {boolean} isInternalSpecial
   */
  Drupal.google_analytics.isInternalSpecial = function (url) {
    var isInternalSpecial = new RegExp('(\/go\/.*)$', 'i');
    return isInternalSpecial.test(url);
  };

  /**
   * Extract the relative internal URL from an absolute internal URL.
   *
   * Examples:
   * - https://mydomain.com/node/1 -> /node/1
   * - https://example.com/foo/bar -> https://example.com/foo/bar
   *
   * @param {string} url
   *   The web url to check.
   *
   * @return {string} getPageUrl
   *   Internal website URL.
   */
  Drupal.google_analytics.getPageUrl = function (url) {
    var extractInternalUrl = new RegExp('^(https?):\/\/' + window.location.host, 'i');
    return url.replace(extractInternalUrl, '');
  };

  /**
   * Extract the download file extension from the URL.
   *
   * @param {string} url
   *   The web url to check.
   *
   * @return {string} getDownloadExtension
   *   The file extension of the passed url. e.g. 'zip', 'txt'
   */
  Drupal.google_analytics.getDownloadExtension = function (url) {
    var extractDownloadextension = new RegExp('\\.(' + drupalSettings.google_analytics.trackDownloadExtensions + ')([\?#].*)?$', 'i');
    var extension = extractDownloadextension.exec(url);
    return (extension === null) ? '' : extension[1];
  };

})(jQuery, Drupal, drupalSettings);
;
/*
 * priority-nav - v1.0.12 | (c) 2016 @gijsroge | MIT license
 * Repository: https://github.com/gijsroge/priority-navigation.git
 * Description: Priority+ pattern navigation that hides menu items if they don't fit on screen.
 * Demo: http://gijsroge.github.io/priority-nav.js/
 */
!function(a,b){"function"==typeof define&&define.amd?define("priorityNav",b(a)):"object"==typeof exports?module.exports=b(a):a.priorityNav=b(a)}(window||this,function(a){"use strict";function b(a,b,c){var d;return function(){var e=this,f=arguments,g=function(){d=null,c||a.apply(e,f)},h=c&&!d;clearTimeout(d),d=setTimeout(g,b),h&&a.apply(e,f)}}var c,d,e,f,g,h,i,j,k={},l=[],m=!!document.querySelector&&!!a.addEventListener,n={},o=0,p=0,q=0,r={initClass:"js-priorityNav",mainNavWrapper:"nav",mainNav:"ul",navDropdownClassName:"nav__dropdown",navDropdownToggleClassName:"nav__dropdown-toggle",navDropdownLabel:"more",navDropdownBreakpointLabel:"menu",breakPoint:500,throttleDelay:50,offsetPixels:0,count:!0,moved:function(){},movedBack:function(){}},s=function(a,b,c){if("[object Object]"===Object.prototype.toString.call(a))for(var d in a)Object.prototype.hasOwnProperty.call(a,d)&&b.call(c,a[d],d,a);else for(var e=0,f=a.length;f>e;e++)b.call(c,a[e],e,a)},t=function(a,b){for(var c=b.charAt(0);a&&a!==document;a=a.parentNode)if("."===c){if(a.classList.contains(b.substr(1)))return a}else if("#"===c){if(a.id===b.substr(1))return a}else if("["===c&&a.hasAttribute(b.substr(1,b.length-2)))return a;return!1},u=function(a,b){var c={};return s(a,function(b,d){c[d]=a[d]}),s(b,function(a,d){c[d]=b[d]}),c},v=function(a,b){if(a.classList)a.classList.toggle(b);else{var c=a.className.split(" "),d=c.indexOf(b);d>=0?c.splice(d,1):c.push(b),a.className=c.join(" ")}},w=function(a,b){return j=document.createElement("span"),g=document.createElement("ul"),h=document.createElement("button"),h.innerHTML=b.navDropdownLabel,h.setAttribute("aria-controls","menu"),h.setAttribute("type","button"),g.setAttribute("aria-hidden","true"),a.querySelector(f).parentNode!==a?void console.warn("mainNav is not a direct child of mainNavWrapper, double check please"):(a.insertAfter(j,a.querySelector(f)),j.appendChild(h),j.appendChild(g),g.classList.add(b.navDropdownClassName),g.classList.add("priority-nav__dropdown"),h.classList.add(b.navDropdownToggleClassName),h.classList.add("priority-nav__dropdown-toggle"),j.classList.add(b.navDropdownClassName+"-wrapper"),j.classList.add("priority-nav__wrapper"),void a.classList.add("priority-nav"))},x=function(a){var b=window.getComputedStyle(a),c=parseFloat(b.paddingLeft)+parseFloat(b.paddingRight);return a.clientWidth-c},y=function(){var a=document,b=window,c=a.compatMode&&"CSS1Compat"===a.compatMode?a.documentElement:a.body,d=c.clientWidth,e=c.clientHeight;return b.innerWidth&&d>b.innerWidth&&(d=b.innerWidth,e=b.innerHeight),{width:d,height:e}},z=function(a){d=x(a),i=a.querySelector(g).parentNode===a?a.querySelector(g).offsetWidth:0,e=D(a)+n.offsetPixels,q=y().width};k.doesItFit=function(a){var c=0===a.getAttribute("instance")?c:n.throttleDelay;o++,b(function(){var b=a.getAttribute("instance");for(z(a);e>=d&&a.querySelector(f).children.length>0||q<n.breakPoint&&a.querySelector(f).children.length>0;)k.toDropdown(a,b),z(a,b),q<n.breakPoint&&C(a,b,n.navDropdownBreakpointLabel);for(;d>=l[b][l[b].length-1]&&q>n.breakPoint;)k.toMenu(a,b),q>n.breakPoint&&C(a,b,n.navDropdownLabel);l[b].length<1&&(a.querySelector(g).classList.remove("show"),C(a,b,n.navDropdownLabel)),a.querySelector(f).children.length<1?(a.classList.add("is-empty"),C(a,b,n.navDropdownBreakpointLabel)):a.classList.remove("is-empty"),A(a,b)},c)()};var A=function(a,b){l[b].length<1?(a.querySelector(h).classList.add("priority-nav-is-hidden"),a.querySelector(h).classList.remove("priority-nav-is-visible"),a.classList.remove("priority-nav-has-dropdown"),a.querySelector(".priority-nav__wrapper").setAttribute("aria-haspopup","false")):(a.querySelector(h).classList.add("priority-nav-is-visible"),a.querySelector(h).classList.remove("priority-nav-is-hidden"),a.classList.add("priority-nav-has-dropdown"),a.querySelector(".priority-nav__wrapper").setAttribute("aria-haspopup","true"))},B=function(a,b){a.querySelector(h).setAttribute("priorityNav-count",l[b].length)},C=function(a,b,c){a.querySelector(h).innerHTML=c};k.toDropdown=function(a,b){a.querySelector(g).firstChild&&a.querySelector(f).children.length>0?a.querySelector(g).insertBefore(a.querySelector(f).lastElementChild,a.querySelector(g).firstChild):a.querySelector(f).children.length>0&&a.querySelector(g).appendChild(a.querySelector(f).lastElementChild),l[b].push(e),A(a,b),a.querySelector(f).children.length>0&&n.count&&B(a,b),n.moved()},k.toMenu=function(a,b){a.querySelector(g).children.length>0&&a.querySelector(f).appendChild(a.querySelector(g).firstElementChild),l[b].pop(),A(a,b),a.querySelector(f).children.length>0&&n.count&&B(a,b),n.movedBack()};var D=function(a){for(var b=a.childNodes,c=0,d=0;d<b.length;d++)3!==b[d].nodeType&&(isNaN(b[d].offsetWidth)||(c+=b[d].offsetWidth));return c},E=function(a,b){window.attachEvent?window.attachEvent("onresize",function(){k.doesItFit&&k.doesItFit(a)}):window.addEventListener&&window.addEventListener("resize",function(){k.doesItFit&&k.doesItFit(a)},!0),a.querySelector(h).addEventListener("click",function(){v(a.querySelector(g),"show"),v(this,"is-open"),v(a,"is-open"),-1!==a.className.indexOf("is-open")?a.querySelector(g).setAttribute("aria-hidden","false"):(a.querySelector(g).setAttribute("aria-hidden","true"),a.querySelector(g).blur())}),document.addEventListener("click",function(c){t(c.target,"."+b.navDropdownClassName)||c.target===a.querySelector(h)||(a.querySelector(g).classList.remove("show"),a.querySelector(h).classList.remove("is-open"),a.classList.remove("is-open"))}),document.onkeydown=function(a){a=a||window.event,27===a.keyCode&&(document.querySelector(g).classList.remove("show"),document.querySelector(h).classList.remove("is-open"),c.classList.remove("is-open"))}};Element.prototype.remove=function(){this.parentElement.removeChild(this)},NodeList.prototype.remove=HTMLCollection.prototype.remove=function(){for(var a=0,b=this.length;b>a;a++)this[a]&&this[a].parentElement&&this[a].parentElement.removeChild(this[a])},k.destroy=function(){n&&(document.documentElement.classList.remove(n.initClass),j.remove(),n=null,delete k.init,delete k.doesItFit)},m&&"undefined"!=typeof Node&&(Node.prototype.insertAfter=function(a,b){this.insertBefore(a,b.nextSibling)});var F=function(a){var b=a.charAt(0);return"."===b||"#"===b?!1:!0};return k.init=function(a){if(n=u(r,a||{}),!m&&"undefined"==typeof Node)return void console.warn("This browser doesn't support priorityNav");if(!F(n.navDropdownClassName)||!F(n.navDropdownToggleClassName))return void console.warn("No symbols allowed in navDropdownClassName & navDropdownToggleClassName. These are not selectors.");var b=document.querySelectorAll(n.mainNavWrapper);s(b,function(a){return l[p]=[],a.setAttribute("instance",p++),(c=a)?(f=n.mainNav,a.querySelector(f)?(w(a,n),g="."+n.navDropdownClassName,a.querySelector(g)?(h="."+n.navDropdownToggleClassName,a.querySelector(h)?(E(a,n),void k.doesItFit(a)):void console.warn("couldn't find the specified navDropdownToggle element")):void console.warn("couldn't find the specified navDropdown element")):void console.warn("couldn't find the specified mainNav element")):void console.warn("couldn't find the specified mainNavWrapper element")}),o++,document.documentElement.classList.add(n.initClass)},k});;
/*! modernizr 3.7.1 (Custom Build) | MIT *
 * https://modernizr.com/download/?-backgroundcliptext-cssgradients-cssgrid_cssgridlegacy-flexbox-setclasses !*/
!function(e,n,t){function r(e,n){return typeof e===n}function o(e,n){return!!~(""+e).indexOf(n)}function s(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):w?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function i(){var e=n.body;return e||(e=s(w?"svg":"body"),e.fake=!0),e}function l(e,t,r,o){var l,a,f,u,d="modernizr",c=s("div"),p=i();if(parseInt(r,10))for(;r--;)f=s("div"),f.id=o?o[r]:d+(r+1),c.appendChild(f);return l=s("style"),l.type="text/css",l.id="s"+d,(p.fake?p:c).appendChild(l),p.appendChild(c),l.styleSheet?l.styleSheet.cssText=e:l.appendChild(n.createTextNode(e)),c.id=d,p.fake&&(p.style.background="",p.style.overflow="hidden",u=C.style.overflow,C.style.overflow="hidden",C.appendChild(p)),a=t(c,e),p.fake?(p.parentNode.removeChild(p),C.style.overflow=u,C.offsetHeight):c.parentNode.removeChild(c),!!a}function a(e){return e.replace(/([A-Z])/g,function(e,n){return"-"+n.toLowerCase()}).replace(/^ms-/,"-ms-")}function f(n,t,r){var o;if("getComputedStyle"in e){o=getComputedStyle.call(e,n,t);var s=e.console;if(null!==o)r&&(o=o.getPropertyValue(r));else if(s){var i=s.error?"error":"log";s[i].call(s,"getComputedStyle returning null, its possible modernizr test results are inaccurate")}}else o=!t&&n.currentStyle&&n.currentStyle[r];return o}function u(n,r){var o=n.length;if("CSS"in e&&"supports"in e.CSS){for(;o--;)if(e.CSS.supports(a(n[o]),r))return!0;return!1}if("CSSSupportsRule"in e){for(var s=[];o--;)s.push("("+a(n[o])+":"+r+")");return s=s.join(" or "),l("@supports ("+s+") { #modernizr { position: absolute; } }",function(e){return"absolute"===f(e,null,"position")})}return t}function d(e){return e.replace(/([a-z])-([a-z])/g,function(e,n,t){return n+t.toUpperCase()}).replace(/^-/,"")}function c(e,n,i,l){function a(){c&&(delete P.style,delete P.modElem)}if(l=!r(l,"undefined")&&l,!r(i,"undefined")){var f=u(e,i);if(!r(f,"undefined"))return f}for(var c,p,g,m,h,y=["modernizr","tspan","samp"];!P.style&&y.length;)c=!0,P.modElem=s(y.shift()),P.style=P.modElem.style;for(g=e.length,p=0;p<g;p++)if(m=e[p],h=P.style[m],o(m,"-")&&(m=d(m)),P.style[m]!==t){if(l||r(i,"undefined"))return a(),"pfx"!==n||m;try{P.style[m]=i}catch(e){}if(P.style[m]!==h)return a(),"pfx"!==n||m}return a(),!1}function p(e,n){return function(){return e.apply(n,arguments)}}function g(e,n,t){var o;for(var s in e)if(e[s]in n)return!1===t?e[s]:(o=n[e[s]],r(o,"function")?p(o,t||n):o);return!1}function m(e,n,t,o,s){var i=e.charAt(0).toUpperCase()+e.slice(1),l=(e+" "+_.join(i+" ")+i).split(" ");return r(n,"string")||r(n,"undefined")?c(l,n,o,s):(l=(e+" "+T.join(i+" ")+i).split(" "),g(l,n,t))}function h(e,n,r){return m(e,t,t,n,r)}var y=[],v={_version:"3.7.1",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){y.push({name:e,fn:n,options:t})},addAsyncTest:function(e){y.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=v,Modernizr=new Modernizr;var x=[],C=n.documentElement,w="svg"===C.nodeName.toLowerCase(),b="Moz O ms Webkit",_=v._config.usePrefixes?b.split(" "):[];v._cssomPrefixes=_;var S={elem:s("modernizr")};Modernizr._q.push(function(){delete S.elem});var P={style:S.elem.style};Modernizr._q.unshift(function(){delete P.style});var T=v._config.usePrefixes?b.toLowerCase().split(" "):[];v._domPrefixes=T,v.testAllProps=m,v.testAllProps=h,Modernizr.addTest("backgroundcliptext",function(){return h("backgroundClip","text")}),Modernizr.addTest("cssgridlegacy",h("grid-columns","10px",!0)),Modernizr.addTest("cssgrid",h("grid-template-rows","none",!0)),Modernizr.addTest("flexbox",h("flexBasis","1px",!0));var k=v._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):["",""];v._prefixes=k,Modernizr.addTest("cssgradients",function(){for(var e,n="background-image:",t="",r=0,o=k.length-1;r<o;r++)e=0===r?"to ":"",t+=n+k[r]+"linear-gradient("+e+"left top, #9f9, white);";Modernizr._config.usePrefixes&&(t+=n+"-webkit-gradient(linear,left top,right bottom,from(#9f9),to(white));");var i=s("a"),l=i.style;return l.cssText=t,(""+l.backgroundImage).indexOf("gradient")>-1}),function(){var e,n,t,o,s,i,l;for(var a in y)if(y.hasOwnProperty(a)){if(e=[],n=y[a],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(o=r(n.fn,"function")?n.fn():n.fn,s=0;s<e.length;s++)i=e[s],l=i.split("."),1===l.length?Modernizr[l[0]]=o:(!Modernizr[l[0]]||Modernizr[l[0]]instanceof Boolean||(Modernizr[l[0]]=new Boolean(Modernizr[l[0]])),Modernizr[l[0]][l[1]]=o),x.push((o?"":"no-")+l.join("-"))}}(),function(e){var n=C.className,t=Modernizr._config.classPrefix||"";if(w&&(n=n.baseVal),Modernizr._config.enableJSClass){var r=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(r,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(e.length>0&&(n+=" "+t+e.join(" "+t)),w?C.className.baseVal=n:C.className=n)}(x),delete v.addTest,delete v.addAsyncTest;for(var z=0;z<Modernizr._q.length;z++)Modernizr._q[z]();e.Modernizr=Modernizr}(window,document);;
(function ($) {

  'use strict';

  /**
   * Branch theme function
   * @see https://www.drupal.org/node/304258#drupal-behaviors
   */
  Drupal.behaviors.branch = {
    'attach': function (context, settings) {

      window.priorityNav.init({
        'mainNavWrapper': 'nav.block--main-nav .nav-wrapper',
        'mainNav': 'ul.nav',
        'breakPoint': 1088,
        'navDropdownLabel': 'More'
      });

      if (Modernizr.cssgrid) {
        var docroot = document.getElementsByTagName('html')[0];
        docroot.classList.remove('no-cssgrid');
      }
    }
  };

  Drupal.behaviors.amfmMobileMenu = {
    'attach': function (context, settings) {

      $(context).find('.control').once().click(function() {
        var targetName = $(this).attr('aria-controls');
        var target = $('#'+targetName);
        var ariaExpanded = $(this).attr('aria-expanded');
        var freeze = $(this).data('freeze');

        if (ariaExpanded === 'true') {
          $(this).attr('aria-expanded', 'false');
        }
        else {
          $(this).attr('aria-expanded', 'true');
        }

        $(this).toggleClass('expanded');
        target.toggleClass('expanded');

        switch (freeze) {
          case 'on':
            $('body').addClass('freeze');
            break;

          case 'off':
            $('body').removeClass('freeze');
            break;

          case 'toggle':
            $('body').toggleClass('freeze');
            break;
        }
      });
    }
  };


})(jQuery);
;
/**
 * @file
 * CKEditor Accordion functionality.
 */

(function ($, Drupal, drupalSettings) {
  'use strict';
  Drupal.behaviors.ckeditorAccordion = {
    attach: function (context, settings) {

      // Create accordion functionality if the required elements exist is available.
      var $ckeditorAccordion = $('.ckeditor-accordion');
      if ($ckeditorAccordion.length > 0) {
        // Create simple accordion mechanism for each tab.
        $ckeditorAccordion.each(function () {
          var $accordion = $(this);
          if ($accordion.hasClass('styled')) {
            return;
          }

          // The first one is the correct one.
          if (!drupalSettings.ckeditorAccordion.accordionStyle.collapseAll) {
            $accordion.children('dt:first').addClass('active');
            $accordion.children('dd:first').addClass('active');
            $accordion.children('dd:first').css('display', 'block');
          }

          // Turn the accordion tabs to links so that the content is accessible & can be traversed using keyboard.
          $accordion.children('dt').each(function () {
            var $tab = $(this);
            var tabText = $tab.text().trim();
            var toggleClass = $tab.hasClass('active') ? ' active' : '';
            $tab.html('<a class="ckeditor-accordion-toggler" href="#"><span class="ckeditor-accordion-toggle' + toggleClass + '"></span>' + tabText + '</a>');
          });

          // Wrap the accordion in a div element so that quick edit function shows the source correctly.
          $accordion.addClass('styled').removeClass('ckeditor-accordion').wrap('<div class="ckeditor-accordion-container"></div>');

          // Trigger an ckeditorAccordionAttached event to let other frameworks know that the accordion has been attached.
          $accordion.trigger('ckeditorAccordionAttached');
        });

        // Add click event to body once because quick edits & ajax calls might reset the HTML.
        $('body').once('ckeditorAccordionToggleEvent').on('click', '.ckeditor-accordion-toggler', function (e) {
          var $t = $(this).parent();
          var $parent = $t.parent();

          // Clicking on open element, close it.
          if ($t.hasClass('active')) {
            $t.removeClass('active');
            $t.next().slideUp();
          }
          else {
            if(!drupalSettings.ckeditorAccordion.accordionStyle.keepRowsOpen) {
              // Remove active classes.
              $parent.children('dt.active').removeClass('active').children('a').removeClass('active');
              $parent.children('dd.active').slideUp(function () {
                $(this).removeClass('active');
              });
            }

            // Show the selected tab.
            $t.addClass('active');
            $t.next().slideDown(300).addClass('active');
          }

          // Don't add hash to url.
          e.preventDefault();
        });
      }
    }
  };
})(jQuery, Drupal, drupalSettings);
;
(function ($) {

  'use strict';

  /**
   * Branch theme function
   * @see https://www.drupal.org/node/304258#drupal-behaviors
   */
  Drupal.behaviors.branch_messages = {
    'attach': function (context, settings) {

      $(context).find('.message--teaser').each(function() {
        var messageState = sessionStorage.getItem('AMFM.message.' + $(this).data('messageId'));
        
        if (messageState !== "false") {
          $(this).removeClass('hidden');
        }
      });
      
      $(context).find('.message--teaser .message__control').once('message').click(function() {
        var message = $(this).parent('.message--teaser');

        // store that this message is disabled.
        sessionStorage.setItem('AMFM.message.' + message.data('messageId'), false);
        $(message).toggleClass('hidden');
      });
    }
  };


})(jQuery);
;
