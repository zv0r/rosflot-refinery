// http://habrahabr.ru/post/177059/
Date.prototype.daysInMonth = function() {
  return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};

(function ($) {
  $.fn.jsonCalendar = function( options ) {
    var settings = $.extend({
      eventsUrl: "/calendar/events/month-events.json",
      months: {
        1: "Январь",
        2: "Февраль",
        3: "Март",
        4: "Апрель",
        5: "Май",
        6: "Июнь",
        7: "Июль",
        8: "Август",
        9: "Сентябрь",
        10: "Октябрь",
        11: "Ноябрь",
        12: "Декабрь"
      },
      month: (new Date()).getMonth() + 1,
      year: (new Date()).getFullYear(),
      headerClass: "header",
      headerTag: "ul",
      headerElementTag: "li",
      headerCurrentMonthClass: "current-month",
      navigateMonthsElement: "a",
      previousMonthClass: "prev-month",
      nextMonthClass: "next-month",
      previousMonthLabel: "&larr;",
      nextMonthLabel: "&rarr;",
      weekClass: "week",
      weekTag: "ul",
      weekElementTag: "li",
      weekEventMatchClass: "with-events",
      dayWithEventTag: "a",
      blankDayPlaceholder: "&nbsp;",
      calendarErrorTag: "p",
      calendarErrorClass: "error",
      eventsListLinkId: "events-list-link-",
      eventsListTag: "div",
      eventsListId: "events-list-",
      eventsListClass: "events-list",
      eventsListItemTag: "p",
      eventsListItemLinkTag: "a",
      eventsListItemLink: "/calendar/events",
      eventsListBackLinkClass: "back-to-calendar",
      eventsListBackLinkTag: "a",
      eventsListBackLinkText: "&larr;&nbsp;Назад",
      calendarErrorMessage: "Ошибка загрузки календаря"
    }, options );

    var render = function(calendar) {
      calendar.empty();

      var currentMonthDate = new Date(settings.year, settings.month - 1, 1);
      var previousMonthDate = new Date(new Date(currentMonthDate).setMonth(currentMonthDate.getMonth() - 1));
      var nextMonthDate = new Date(new Date(currentMonthDate).setMonth(currentMonthDate.getMonth() + 1));

      var previousMonth = previousMonthDate.getMonth() + 1;
      var previousYear = previousMonthDate.getFullYear();
      var nextMonth = nextMonthDate.getMonth() + 1;
      var nextYear = nextMonthDate.getFullYear();

      // Данные, которые будут в шапке календаря
      var headerId = settings.headerClass + "-" + (new Date()).getTime();
      var calendarHeader = jQuery("<" + settings.headerTag + ">", {
        "class": settings.headerClass,
        "id": headerId
      });

      jQuery("<" + settings.headerElementTag + ">", {
        "html": jQuery("<" + settings.navigateMonthsElement + ">", {
                  "html": settings.previousMonthLabel,
                  "href": "#" + headerId
                }),
        "class": settings.previousMonthClass
      }).appendTo(calendarHeader);

      jQuery("<" + settings.headerElementTag + ">", {
        "html": settings.months[settings.month] + " " + settings.year,
        "class": settings.headerCurrentMonthClass
      }).appendTo(calendarHeader);

      jQuery("<" + settings.headerElementTag + ">", {
        "html": jQuery("<" + settings.navigateMonthsElement + ">", {
                  "html": settings.nextMonthLabel,
                  "href": "#" + headerId
                }),
        "class": settings.nextMonthClass
      }).appendTo(calendarHeader);

      // Календарь должен обновляться при навигации по месяцам
      calendar.unbind();

      calendar.on("click", "." + settings.previousMonthClass + " a", function(e) {
        settings.month = previousMonth;
        settings.year = previousYear;
        render(calendar);
      });

      calendar.on("click", "." + settings.nextMonthClass + " a", function(e) {
        settings.month = nextMonth;
        settings.year = nextYear;
        render(calendar);
      });

      // Вставляем шапку календаря в основной блок
      calendarHeader.appendTo(calendar);

      // Получим список событий за просматриваемый месяц
      events = $.ajax({
        dataType: "json",
        url: settings.eventsUrl,
        data: {
          month: currentMonthDate.getMonth() + 1,
          year: currentMonthDate.getFullYear()
        },
        success: function(data) {
          // Смотрим, что там получили в JSON.
          // Распределяем по дням.
          eventsList = new Array();
          for (i = 0; i < data.length; i++) {
            day = (new Date(data[i].starts_at)).getDate();
            // Создадим блок с описанием событий дня, если его нет
            if (!eventsList[day]) {
              eventsList[day] = new Array();
              eventsListBlock = jQuery("<" + settings.eventsListTag + ">", {
                "class": settings.eventsListClass,
                "id": settings.eventsListId + day,
                "html": jQuery("<" + settings.eventsListItemTag + ">", {
                  "class": settings.eventsListBackLinkClass,
                  "html": jQuery("<" + settings.eventsListBackLinkTag + ">", {
                    "html": settings.eventsListBackLinkText,
                    "href": "#" + headerId
                  })
                })
              });

              eventsListBlock.appendTo(calendar);

              calendar.on("click", "#" + settings.eventsListId + day + " ." + settings.eventsListBackLinkClass + " " + settings.eventsListBackLinkTag, function(e) {
                $(this).parents(".events-list").fadeOut(400);
              });
            }
            // Генерируем ссылку на событие
            jQuery("<" + settings.eventsListItemTag + ">", {
              "html": jQuery("<" + settings.eventsListItemLinkTag + ">", {
                "html": data[i].title,
                "href": settings.eventsListItemLink + "/" + data[i].id
              })
            }).appendTo(eventsListBlock);
            eventsList[day].push(data[i]);
          }

          // Рендерим непосредственно календарь. Понедельно
          while (currentMonthDate < nextMonthDate) {
            var calendarWeek = jQuery("<" + settings.weekTag + ">", {
              "class": settings.weekClass
            });
            for (i = 1; i <= 7; i++) {
              // Воскресенье - 7й день!
              dayOfWeek = (currentMonthDate.getDay() == 0 ? 7 : currentMonthDate.getDay());
              if (dayOfWeek == i && currentMonthDate < nextMonthDate) {

                if (eventsList[currentMonthDate.getDate()]) {
                  jQuery("<" + settings.weekElementTag + ">", {
                    "html": jQuery("<" + settings.dayWithEventTag + ">", {
                      "html": currentMonthDate.getDate(),
                      "href": "#" + settings.eventsListId + currentMonthDate.getDate(),
                      "id": settings.eventsListLinkId + currentMonthDate.getDate()
                    }),
                    "class": settings.weekEventMatchClass
                  }).appendTo(calendarWeek);

                  calendar.on("click", "#" + settings.eventsListLinkId + currentMonthDate.getDate(), function(e) {
                    // jQuery("#" + settings.eventsListId + currentMonthDate.getDate()).fadeIn(400);
                    var listDay = jQuery(e.target).html();
                    jQuery("#" + settings.eventsListId + listDay).fadeIn(400);
                  });

                } else {
                  jQuery("<" + settings.weekElementTag + ">", {
                    "html": currentMonthDate.getDate()
                  }).appendTo(calendarWeek);
                }

                currentMonthDate.setDate(currentMonthDate.getDate() + 1);
              } else {
                jQuery("<" + settings.weekElementTag + ">", {
                  "html": settings.blankDayPlaceholder
                }).appendTo(calendarWeek);
              }
            }
            calendarWeek.appendTo(calendar);
          }
        },
        error: function() {
          calendar.empty();
          jQuery("<" + settings.calendarErrorTag + ">", {
            "html": settings.calendarErrorMessage,
            "class": settings.calendarErrorClass
          }).appendTo(calendar);
        }
      });
    };

    render(this);
  };
})(jQuery);