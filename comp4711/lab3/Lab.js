// Helper Functions
const $ = (selectors) => {
    const ele = document.querySelector(selectors)
    if (!ele) return;
    ele.toggle = () => {
        if (ele.classList.contains('none')) {
            ele.classList.remove('none');
        } else {
            ele.classList.add('none');
        }
    };
    return ele;
};

$.ele = (name, attrs, text) => {
    attrs = attrs || [];
    const ele = document.createElement(name);
    attrs.forEach(([name, value]) => {
        ele.setAttribute(name, value);
    });
    if (text) {
        ele.innerText = text
    }
    ele.add = (child) => {
        ele.append(child);
        return ele;
    };
    ele.on = (name, callback) => {
        ele.addEventListener(name, callback);
        return ele;
    }
    return ele;
};
// Components
let numCards = 0;
const personCard = ({ name, portrait, description }) => {
    numCards++;
    return $.ele('div', [['class', 'person-card'], ["id", "person-card-" + numCards]])
        .add(
            $.ele('div', [['class', 'person-portrait']])
                .add($.ele('img', [['src', portrait], ['alt', 'portrait']]))
        )
        .add(
            $.ele('div', [['class', 'person-profile']])
                .add($.ele('p', [['class', 'name']], name))
                .add($.ele('p', [['class', 'description']], description))
        )
        .add(
            $.ele('div').add(
                $.ele('div', [['class', 'btn btn-danger'], ['key', numCards]], 'Delete'))
                .on('click', ({ target }) => {
                    const id = target.attributes.getNamedItem('key').value;
                    $('#person-card-' + id).remove();
                })
        );
}
// Main
// set up event handlers
$('#toggle-add-artist-form').addEventListener('click', () => {
    $('#add-artist-form').toggle();
    // clear the input
    $("#input-name").value = '';
    $("#input-image-url").value = '';
    $("#input-about").value = '';
});
$('#add-artist').addEventListener('click', () => {
    // gather the input
    const person = {
        name: $("#input-name").value,
        portrait: $("#input-image-url").value,
        description: $("#input-about").value,
    };
    // clear the input
    $("#input-name").value = '';
    $("#input-image-url").value = '';
    $("#input-about").value = '';
    // add the artist
    $('.people-list').append(personCard(person));
});