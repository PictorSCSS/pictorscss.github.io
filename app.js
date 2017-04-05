
var app = $({});
var page = $('section#page');;
var nav = $('section#nav');;

var escElement = document.createElement('textarea');

function escapeHTML(html) {
    escElement.textContent = html;
    return escElement.innerHTML;
}

function unescapeHTML(html) {
    escElement.innerHTML = html;
    return escElement.textContent;
}

app.on('highlight', function () {

    $('pre code').each(function(i, block) {

        hljs.highlightBlock(block);
    });
});

app.on('page', function(e, name) {

    $.get(['./pages/', name, '.html'].join(''), function (data) {

        page.html(data);
        app.trigger('highlight');

    }).fail(function () {

        alert('Not Found');

    });
});

app.on('part', function(e, opts) {

    var name = opts.name, appendTo = opts.appendTo;

    $.get(['./parts/', name, '.html'].join(''), function (data) {

        appendTo.html(data);
        app.trigger('part-loaded', name);

    }).fail(function () {

        alert('Part Not Found');

    });
});

function linkNavigate(target) {

    var href = target.href.replace(window.location.origin+'/#', '');

    href && app.trigger('page', href);
}

$(window).on('click', function(e) {

    var target = $(e.srcTarget || e.target);
    var resolved = false;


    if (target) {
        if (target[0].nodeName === 'A') {

            linkNavigate(target[0]);
            resolved = true;

        } else {
            target = target.parent('a');

            if (target.length) {
                linkNavigate(target[0]);
                resolved = true;
            }
        }
    }

    if (resolved) {

        // e.stopPropagation();
        // return false;
    }

});


function extractColors () {

    var div = document.createElement('div');
    div.classList.add('colors', 'hide');
    document.body.append(div);

    var extract = getComputedStyle(div).content.replace(/\"/ig, '');

    div.remove();
    delete div;

    var colors = {};

    extract.split('|').forEach(function(str) {

        if (!!str) {

            var split = str.split(',');

            colors[split[0]] = {
                color: split[1],
                font: split[2],
                hover: split[3],
                fontHover: split[4],
            }
        }
    });

    return colors;
}

function changeBgColor (color) {

    this.parentElement.classList.remove('has-selected', 'open');
    var selected = this.parentElement.querySelector('.selected');

    if (selected) {
        selected.classList.remove('selected');
    }
    var icon = this.children[0];
    icon.classList.remove('fa-refresh', 'fa-check');

    if (document.body.style.background) {

        document.body.style.background = '';
        icon.classList.add('fa-refresh');
        return
    }

    this.parentElement.classList.add('has-selected');
    this.classList.add('selected');
    icon.classList.add('fa-check');

    document.body.style.background = color;
}

$(document).ready(function () {

    var colors = extractColors();
    var colorPicker = $('#colorPicker .options');

    for (key in colors) {

        var button = '<button onclick="changeBgColor.bind(this)(\''+colors[key].color+'\')" class="'+key+' xs margin-xs">' +
                        '<i class="fa fa-refresh"></i> ' + key +
                    '</button>';

        colorPicker.append(button);
    }

    setTimeout(function() {

        if (window.location.hash) {

            linkNavigate(window.location);

        }
        else {

            app.one('part-loaded', function() {

                nav.find('#logo a img').click();
            });
        }


        app.trigger('part', { name: 'nav', appendTo: nav });

    }, 10);


});
