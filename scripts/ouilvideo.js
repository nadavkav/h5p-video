/** @namespace H5P */
ouil.Video = (function ($) {

  /**
   * ouilvideo video player for H5P.
   *
   * @class
   * @param {Array} sources Video files to use
   * @param {Object} options Settings for the player
   * @param {Object} l10n Localization strings
   */
  function ouilvideo(sources, options, l10n) {
    var self = this;

    var player;
    var id = 'h5p-ouilvideo-' + numInstances;
    numInstances++;
    var bynetAPI = 'http://api.bynetcdn.com/Redirector/openu/manifest/##AR##/HLS/playlist.m3u8'
    var TheoplayerURL = '/local/ouil_video/theoplayer.php'
    var ouilDomain = 'openu.ac.il'
    var isHD = false;
    var manifest = bynetAPI.replace('##AR##',getId(sources[0].path));
    var $wrapper = $('<div/>');
    var $placeholder = $('<div/>', {
      id: id,
      text: l10n.loading
    }).appendTo($wrapper);

    // Optional placeholder
    /* var $placeholder = $('<iframe id="' + id 
        + '" type="text/html" width="640" height="360" src= TheoplayerURL 
        + "?width=640&height=480&method=VOD&in=0&out=0&vtt=' + getId(sources[0].path) 
        + '&clipurl=' + encodeURIComponent(manifest) + '&autoplay=' 
        + (options.autoplay ? 1 : 0) + '&controls=' + (options.controls ? 1 : 0) 
        + '&loop=' + (options.loop ? 1 : 0) + '&protocol=hls" frameborder="0"></iframe>')
        .appendTo($wrapper); */

    /**
     * Use the ouilvideo API to create a new player
     *
     * @private
     */
    var create = function () {
      if (!$placeholder.is(':visible') || player !== undefined) {
        return;
      }

      if (window.Theoplayer === undefined) {
        // Load API first
        loadIframe(create);
        return;
      }

      var width = $wrapper.width();
      if (width < 200) {
        width = 200;
      }

      player = window.Theoplayer(0);
    };

    /**
     * Indicates if the video must be clicked for it to start playing.
     * For instance ouilvideo videos on iPad must be pressed to start playing.
     *
     * @public
     */
    self.pressToPlay = navigator.userAgent.match(/iPad/i) ? true : false;

    /**
    * Appends the video player to the DOM.
    *
    * @public
    * @param {jQuery} $container
    */
    self.appendTo = function ($container) {
      $container.addClass('h5p-ouilvideo').append($wrapper);
      create();
    };

    /**
     * Get list of available qualities. Not available until after play.
     *
     * @public
     * @returns {Array}
     */
    self.getQualities = function () {
      if (!window.Theoplayer || !window.Theoplayer.controller) {
        return;
      }
      var qualities = [];
      $(window.Theoplayer.controller(0,'renditionController').renditions).each(function(){
        qualities.push({
          bandwidth: this.bandwidth,
          name: this.id,
          label: this.name,
          uri: this.uri
        })
      })
      if (!qualities.length) {
        return; // No qualities
      }
      return qualities;
    };

    /**
     * Get current playback quality. Not available until after play.
     *
     * @public
     * @returns {String}
     */
    self.getQuality = function () {
      if (!window.Theoplayer || !window.Theoplayer.controller) {
        return;
      }

      var quality = window.Theoplayer.controller(0,'renditionController').activeRendition.name;
    };

    /**
     * Set current playback quality. Not available until after play.
     * Listen to event "qualityChange" to check if successful.
     *
     * @public
     * @params {String} [quality]
     */
    self.setQuality = function (qualityId) {
      if (!window.Theoplayer || !window.Theoplayer.controller) {
        return;
      }

      window.Theoplayer.controller(0,'renditionController').activeRendition = qualityId;
    };

    /**
     * Starts the video.
     *
     * @public
     */
    self.play = function () {
      if (!player || !player.play) {
        self.on('ready', self.play);
        return;
      }

      player.play();
    };

    /**
     * Pauses the video.
     *
     * @public
     */
    self.pause = function () {
      self.off('ready', self.play);
      if (!player || !player.pause) {
        return;
      }
      player.pause();
    };

    /**
     * Seek video to given time.
     *
     * @public
     * @param {Number} time
     */
    self.seek = function (time) {
      if (!player || !player.currentFrame) {
        return;
      }

      player.currentFrame = time;
    };

    /**
     * Get elapsed time since video beginning.
     *
     * @public
     * @returns {Number}
     */
    self.getCurrentTime = function () {
      if (!player || !player.currentTime) {
        return;
      }

      return player.currentTime;
    };

    /**
     * Get total video duration time.
     *
     * @public
     * @returns {Number}
     */
    self.getDuration = function () {
      if (!player || !player.duration) {
        return;
      }

      return player.duration;
    };

    /**
     * Get percentage of video that is buffered.
     *
     * @public
     * @returns {Number} Between 0 and 100
     */
    self.getBuffered = function () {
      if (!player || !player.buffered) {
        return;
      }

      return player.buffered;
    };

    /**
     * Turn off video sound.
     *
     * @public
     */
    self.mute = function () {
      if (!player || !player.muted) {
        return;
      }

      player.muted = ture;
    };

    /**
     * Turn on video sound.
     *
     * @public
     */
    self.unMute = function () {
      if (!player || !player.muted) {
        return;
      }

      player.muted = false;
    };

    /**
     * Check if video sound is turned on or off.
     *
     * @public
     * @returns {Boolean}
     */
    self.isMuted = function () {
      if (!player || !player.muted) {
        return;
      }

      return player.muted;
    };

    /**
     * Returns the video sound level.
     *
     * @public
     * @returns {Number} Between 0 and 100.
     */
    self.getVolume = function () {
      if (!player || !player.volume) {
        return;
      }

      return player.volume;
    };

    /**
     * Set video sound level.
     *
     * @public
     * @param {Number} level Between 0 and 100.
     */
    self.setVolume = function (level) {
      if (!player || !player.volume) {
        return;
      }

      player.volume = level;
    };
    
    /**
     * Returns the video playback rate.
     * ADDED BY YARONHE (yaronhelfer@gmail.com)
     *
     * @public
     * @returns {Number} Between 0.5 and 2 (1 = normal).
     */
    self.getPbrate = function () {
      if (!player || !player.playbackRate) {
        return;
      }
      return player.playbackRate;
    };

    /**
     * Set video playback rate.
     * ADDED BY YARONHE (yaronhelfer@gmail.com)
     *
     * @public
     * @param {Number} Between 0.5 and 2 (1 = normal).
     */
    self.setPbrate = function (rate) {
      if (!player || !player.playbackRate) {
        return;
      }
      player.playbackRate = rate;
    };

    // Respond to resize events by setting the YT player size.
    self.on('resize', function () {
      if (!player) {
        // Player isn't created yet. Try again.
        create();
        return;
      }

      // Use as much space as possible
      $wrapper.css({
        width: '100%',
        height: '100%'
      });

      var width = $wrapper[0].clientWidth;
      var height = options.fit ? $wrapper[0].clientHeight : (width * (9/16));

      // Set size
      $wrapper.css({
        width: width + 'px',
        height: height + 'px'
      });

      player.width = width;
      player.height = height;
    });
  }

  /**
   * Check to see if we can play any of the given sources.
   *
   * @public
   * @static
   * @param {Array} sources
   * @returns {Boolean}
   */
  ouilvideo.canPlay = function (sources) {
    return getId(sources[0].path);
  };

  /**
   * Find id of ouilvideo video from given URL.
   *
   * @private
   * @param {String} url
   * @returns {String} ouilvideo video identifier
   */
  var getId = function (url) {
    var matches = url.match(^bynet:(\S+?(_hd))_mp4$);
    if (matches && matches[1]) {
      //Verify domain for CORS
      if(ORIGIN.indexOf(ouilDomain) < 0){
        self.trigger('error', l10n.DomainCheckError);
        return false;
      }
      isHD = matches[2];
      return matches[1];
    }
  };

  /**
   * Load the IFrame Player API asynchronously.
   */
    var loadIframe = function (loaded) {
      // Load the API our self
      $.get( manifest ).done( function(data){
        if(data.substring(0,7) == '#EXTM3U'){
          $('<iframe id="' + id + '" type="text/html" width="640" height="360" frameborder="0"/>')
          .attr('src', TheoplayerURL + "?width=640&height=480&method=VOD&in=0&out=0&vtt=" 
            + getId(sources[0].path) + '&clipurl=' + encodeURIComponent(manifest) + '&autoplay=' + (options.autoplay ? 1 : 0) 
            + '&controls=' + (options.controls ? 1 : 0) + '&loop=' + (options.loop ? 1 : 0) + '&protocol=hls')
          .appendTo($wrapper);
          window.onOuilVideoPlayerReady = function(theoplayer){
            window.Theoplayer = theoplayer;
            loaded();
            return;
          }
        }else self.trigger('error', l10n.BynetInvalidId);
      }).error(function(data){
        self.trigger('error', l10n.BynetConnectionError);
      })
    }
  };
  
  /** @constant {Object} */
  var LABELS = {
    highres: '2160p',
    hd1440: '1440p',
    hd1080: '1080p',
    hd720: '720p',
    large: '480p',
    medium: '360p',
    small: '240p',
    tiny: '144p',
    auto: 'Auto'
  };

  /** @private */
  var numInstances = 0;

  // Extract the current origin (used for security)
  var ORIGIN = window.location.href.match(/http[s]?:\/\/[^\/]+/)[0];

  return ouilvideo;
})(H5P.jQuery);

// Register video handler
H5P.videoHandlers = H5P.videoHandlers || [];
H5P.videoHandlers.push(ouil.Video);
