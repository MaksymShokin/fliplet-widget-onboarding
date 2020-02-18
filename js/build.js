Fliplet.Widget.instance('onboarding', function(data) {
  var $container = $(this);
  var widgetInstanceId = data.id;
  var pvKey = 'fl-onboarding-layout-' + data.uuid;
  var delayTime = data.delaySlides ? data.delaySlides * 1000 : 3000;

  function authenticateImages(onImageLoad) {
    return Fliplet().then(function() {
      if (_.get(data, 'fullImageConfig.url')
        && Fliplet.Media.isRemoteUrl(data.fullImageConfig.url)) {
        $container.css({
          backgroundImage: 'url(' + Fliplet.Media.authenticate(data.fullImageConfig.url) + ')'
        });
      }

      _.forEach(data.items, function(item) {
        if (!_.get(item, 'imageConf.url') || !Fliplet.Media.isRemoteUrl(item.imageConf.url)) {
          return;
        }

        var $img = $('<img />');

        $container.find('.swiper-slide[data-slide-id="' + item.id + '"] .swiper-slide-image')
          .attr('src', Fliplet.Media.authenticate(item.imageConf.url));

        if (typeof onImageLoad === 'function') {
          $img.on('load', onImageLoad);
        }

        $img.attr('src', Fliplet.Media.authenticate(item.imageConf.url));
      });
    });
  }

  function initOnboarding() {
    var swiper = new Swiper('.swiper-container', {
      direction: 'horizontal',
      loop: false,
      autoHeight: true,
      pagination: '.swiper-pagination-' + widgetInstanceId,
      paginationClickable: true,
      nextButton: '.swiper-button-next-' + widgetInstanceId,
      prevButton: '.swiper-button-prev-' + widgetInstanceId,
      grabCursor: true
    });

    $('.onboarding-holder').removeClass('loading');

    authenticateImages(swiper.update);
    swiper.update();

    $(window).on('resize', function() {
      swiper.update();
    });

    Fliplet.Hooks.on('appearanceChanged', function() {
      swiper.update();
    });

    $container.find('.ob-skip span').click(function() {
      Fliplet.Analytics.trackEvent({
        category: 'onboarding',
        action: 'skip'
      });

      if (data.skipSeenEnabled) {
        return Fliplet.App.Storage.set(pvKey, {
          seen: true
        }).then(function() {
          if (_.get(data, 'skipLinkAction') && !_.isEmpty(data.skipLinkAction)) {
            Fliplet.Navigate.to(data.skipLinkAction);
          }
        });
      }

      if (_.get(data, 'skipLinkAction') && !_.isEmpty(data.skipLinkAction)) {
        Fliplet.Navigate.to(data.skipLinkAction);
      }
    });

    $container.find('.btn[data-slide-button-id]').click(function(event) {
      event.preventDefault();
      var itemData = _.find(data.items, { id: $(this).data('slide-button-id') });

      Fliplet.Analytics.trackEvent({
        category: 'onboarding',
        action: 'button_click',
        label: $(this).val()
      });

      if (data.skipSeenEnabled) {
        return Fliplet.App.Storage.set(pvKey, {
          seen: true
        }).then(function() {
          if (_.get(itemData, 'linkAction') && !_.isEmpty(itemData.linkAction)) {
            Fliplet.Navigate.to(itemData.linkAction);
          }
        });
      }

      if (_.get(itemData, 'linkAction') && !_.isEmpty(itemData.linkAction)) {
        Fliplet.Navigate.to(itemData.linkAction);
      }
    });
  }

  // Initialization
  if (data.skipSeenEnabled && data.seenLinkAction && !_.isEmpty(data.seenLinkAction)) {
    Fliplet.App.Storage.get(pvKey).then(function(value) {
      if (value && value.seen && !Fliplet.Env.get('interact')) {
        setTimeout(function() {
          Fliplet.Navigate.to(data.seenLinkAction).catch(function() {
            initOnboarding();
          });
        }, 800);
        return;
      }

      if (data.enableDelay && !Fliplet.Env.get('interact')) {
        setTimeout(initOnboarding, delayTime);
      } else {
        initOnboarding();
      }
    });
  } else {
    if (data.enableDelay && !Fliplet.Env.get('interact')) {
      setTimeout(initOnboarding, delayTime);
    } else {
      initOnboarding();
    }
  }
});
