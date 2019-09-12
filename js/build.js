Fliplet.Widget.instance('onboarding', function (config) {
  var container = $('[data-onboarding-id="' + config.id + '"]');
  var widgetInstanceId = config.id;
  var pvKey = 'fl-onboarding-layout-' + config.uuid;
  var delayTime = config.delaySlides ? config.delaySlides * 1000 : 3000;

  var initOnboarding = function () {
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

    swiper.update();

    $(window).on('resize', function() {
      swiper.update();
    });

    Fliplet.Hooks.on('appearanceChanged', function () {
      swiper.update();
    });

    $(container).find('.ob-skip span').click(function () {
      Fliplet.Analytics.trackEvent({
        category: 'onboarding',
        action: 'skip'
      });

      if (config.skipSeenEnabled) {
        return Fliplet.App.Storage.set(pvKey, {
          seen: true
        }).then(function() {
          if (!_.isEmpty(_.get(config, 'skipLinkAction'))) {
            Fliplet.Navigate.to(config.skipLinkAction);
          }
        });
      }

      if (!_.isEmpty(_.get(config, 'skipLinkAction'))) {
        Fliplet.Navigate.to(config.skipLinkAction);
      }
    });

    $(container).find('.btn[data-slide-button-id]').click(function (event) {
      event.preventDefault();
      var itemData = _.find(config.items,{ id: $(this).data('slide-button-id') });

      Fliplet.Analytics.trackEvent({
        category: 'onboarding',
        action: 'button_click',
        label: $(this).val()
      });

      if (config.skipSeenEnabled) {
        return Fliplet.App.Storage.set(pvKey, {
          seen: true
        }).then(function() {
          if (!_.isEmpty(_.get(itemData, 'linkAction'))) {
            Fliplet.Navigate.to(itemData.linkAction);
          }
        });
      }

      if (!_.isEmpty(_.get(itemData, 'linkAction'))) {
        Fliplet.Navigate.to(itemData.linkAction);
      }
    });
  }

  // Initialization
  if (config.skipSeenEnabled && !_.isUndefined(config.seenLinkAction) && !_.isEmpty(config.seenLinkAction)) {
    Fliplet.App.Storage.get(pvKey).then(function(value) {
      if (value && value.seen && !Fliplet.Env.get('interact')) {
        setTimeout(function() {
          Fliplet.Navigate.to(config.seenLinkAction).catch(function () {
            initOnboarding();
          });
        }, 800);
        return;
      }

      if (config.enableDelay && !Fliplet.Env.get('interact')) {
        setTimeout(initOnboarding, delayTime);
      } else {
        initOnboarding();
      }
    });
  } else {
    if (config.enableDelay && !Fliplet.Env.get('interact')) {
      setTimeout(initOnboarding, delayTime);
    } else {
      initOnboarding();
    }
  }
});