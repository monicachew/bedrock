;(function($) {
    'use strict';

    var tourIsVisible = false;
    var $tour = $('#firstrun').detach();
    var $modal = $('#modal').detach().show();

    $('.tour-highlight').on('tour-step', function () {
        Mozilla.UITour.showHighlight(this.dataset.target);
    });

    $('.tour-info').on('tour-step', function () {
        Mozilla.UITour.showInfo(this.dataset.target, this.dataset.title, this.dataset.text);
    });

    $('.tour-menu').on('tour-step', function () {
        Mozilla.UITour.showMenu(this.dataset.target);
    });

    function updateControls () {
        var $current = $('.ui-tour-list li.current');
        var step = $('.ui-tour-list li.current').data('step');

        if (step === 4) {
            $('button.close').off().one('click', closeTour).addClass('done');
        } else {
            $('button.close').off().one('click', compactTour).removeClass('done');
        }

        if ($current.hasClass('first')) {
            $('button.prev').attr('disabled', 'disabled');
        } else if ($current.hasClass('last')) {
            $('button.next').attr('disabled', 'disabled');
        } else {
            $('button.step').removeAttr('disabled');
        }
    }

    function onTourStep (e) {
        if (e.originalEvent.propertyName === 'transform') {
            var step = $('.ui-tour-list li.current').data('step');
            Mozilla.UITour.hideInfo();
            Mozilla.UITour.hideHighlight();
            // Mozilla.UITour.removePinnedTab();
            $('.ui-tour-list li.current .step-target').delay(100).trigger('tour-step');
            $('.progress-step span').text(step);
            $('.progress-step progress').val(step);

            // hide menu panel when not needed as it's now sticky.
            if (!$('.ui-tour-list li.current').hasClass('app-menu')) {
                Mozilla.UITour.hideMenu('appmenu');
            }
        }
    }

    function goToNextTourStep (e) {
        e.preventDefault();
        if ($(this).hasClass('up')) {
            return;
        }
        var step = $(this).hasClass('prev') ? 'prev' : 'next';
        var $current = $('.ui-tour-list li.current');
        if (step === 'prev') {
            $current.removeClass('current next-out').addClass('prev-out');
            $current.prev().addClass('current');
        } else if (step === 'next') {
            $current.removeClass('current prev-out').addClass('next-out');
            $current.next().addClass('current');
        }
        updateControls();
    }

    function goToStep(step) {
        $('.ui-tour-list .tour-step.current').removeClass('current');
        $('.ui-tour-list .tour-step[data-step="' + step + '"]').addClass('current');
        $('.ui-tour-list .tour-step:gt(' + step + ')').addClass('prev-out');
        $('.ui-tour-list .tour-step:lt(' + step + ')').addClass('next-out');
        updateControls();
    }

    function closeTour() {
        $tour.removeClass('in');
        $('#modal').fadeOut();
    }

    function compactTour() {
        tourIsVisible = false;
        Mozilla.UITour.hideHighlight();
        Mozilla.UITour.hideMenu('appmenu');
        $('#firstrun').removeClass('in').addClass('compact');
        $('.ui-tour-list .tour-step.current .tour-content').fadeOut();
        $('.ui-tour-list .tour-step.current .tour-video').fadeOut();
        $('.ui-tour-controls .prev').fadeOut();
        $('.ui-tour-controls .close').fadeOut();
        $('.ui-tour-controls .next').addClass('up');
        $('button.up').one('click', expandTour);
        $('#modal').fadeOut('slow', function () {
            $('body').removeClass('noscroll');
        });
    }

    function expandTour() {
        tourIsVisible = true;
        window.scrollTo(0,0);
        $('#firstrun').removeClass('compact').addClass('in');
        $('.ui-tour-list .tour-step.current .tour-content').fadeIn();
        $('.ui-tour-list .tour-step.current .tour-video').fadeIn();
        $('.ui-tour-controls .prev').fadeIn();
        $('.ui-tour-controls .close').fadeIn();
        $('.ui-tour-controls .up').removeClass('up');
        $('button.close').one('click', compactTour);
        $('#modal').fadeIn('slow', function () {
            $('body').addClass('noscroll');
        });
    }

    function startTour() {

        window.scrollTo(0,0);
        tourIsVisible = true;

        $('button.close').one('click', compactTour);

        $('button.step').removeAttr('disabled');
        updateControls();

        $('#modal').fadeIn('fast', function () {
            $tour.addClass('in');
            tourIsVisible = true;
        });

        $('.modal-inner').addClass('out');

        Mozilla.UITour.hideInfo();
        $('.ui-tour-list li.current .step-target').trigger('tour-step');
    }

    function handleVisibilityChange () {
        if (document.hidden) {
            Mozilla.UITour.hideHighlight();
            Mozilla.UITour.hideInfo();
            Mozilla.UITour.hideMenu('appmenu');
        } else  {
            if (tourIsVisible) {
                var step = $('.ui-tour-list li.current').data('step');
                $('.ui-tour-list li.current .step-target').delay(100).trigger('tour-step');
                $('.progress-step span').text(step);
                $('.progress-step progress').val(step);
            } else {
                $('.tour-init').trigger('tour-step');
            }
        }
    }

    function init () {
        var $doc = $(document);
        $('body').append($modal).append($tour).addClass('noscroll');
        $modal.on('click', startTour);
        $doc.on('transitionend', '.ui-tour-list li.current', onTourStep);
        $doc.on('visibilitychange', handleVisibilityChange);
        $('.tour-init').trigger('tour-step');
        $('button.step').on('click', goToNextTourStep);
    }

    init();

})(window.jQuery);