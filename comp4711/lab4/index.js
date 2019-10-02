Rongyi.register('ArtistForm', class extends Rongyi.Component {

    render() {
        return `
        <div id="add-artist-form" class="v-form">
            <input id="input-name" class="input-bar" placeholder="Artist Name" />
            <input id="input-about" class="input-bar" placeholder="About Artist"/>
            <input id="input-image-url" class="input-bar" placeholder="Image URL"/>
            <div id="add-artist" class="btn btn-normal" ry-on:click="methods.onSubmit">Add</div>
        </div>`;
    }

    onSubmit = () => {
        const name = this.ref.querySelector('#input-name').value;
        const about = this.ref.querySelector('#input-about').value;
        const imageUrl = this.ref.querySelector('#input-image-url').value;
        this.props.onSubmit({ name, about, imageUrl });
    }

});

Rongyi.register('PersonCard', class extends Rongyi.Component {

    render() {
        const { name, about, imageUrl, key } = this.props;
        return `
        <div class="person-card" key="${key}">
            <div class="person-portrait">
                <img src="${imageUrl}" alt="portrait" />
            </div>
            <div class="person-profile">
                <p class="name">${name}</p>
                <p class="description">${about}</p>
            </div>
            <div>
                <div class="btn btn-danger" ry-on:click="methods.onDeleteClick">Delete</div>
            </div>
        </div>`;
    }

    onDeleteClick = () => {
        const { onDelete, key } = this.props;
        onDelete(key);
    }

});

class App extends Rongyi.Component {

    constructor(props) {
        super(props);
        this.state = {
            displayForm: false,
            peopleList: [],
            displayList: []
        };
    }

    componentDidMount() {
        let list = localStorage.getItem('peopleList');
        if (list == undefined) {
            localStorage.setItem('peopleList', JSON.stringify([]));
            return;
        }
        list = JSON.parse(list);
        this.setPeopleList(list);
    }

    render() {
        const { displayForm } = this.state;

        return `
        <div class="App">
            <div class="lab2-header">
                <p class="page-title">Artist Directory</p>
                <div class="h-container">
                    <input id="search-bar" type="search" class="input-bar" />
                    <div id="toggle-add-artist-form" class="btn btn-normal" ry-on:click="methods.onToggleForm">Add artist</div>
                    <div class="btn btn-normal" ry-on:click="methods.onSearchClick">Search</div>
                </div>
                ${displayForm ? `<ArtistForm onSubmit="methods.onArtistAdd" />` : ''}
            </div>
            <div class="people-list">
                ${this.renderPeopleList()}
            </div>
        </div>`;
    }

    renderPeopleList = () => {
        return this.state.displayList.map(({ name, about, imageUrl }, i) => {
            return `<PersonCard name="${name}" about="${about}" imageUrl="${imageUrl}" key="${i}" onDelete="methods.onArtistDelete" />`;
        }).join(' ');
    }

    onArtistAdd = (artist) => {
        this.addArtist(artist);
    }

    onArtistDelete = (key) => {
        this.deleteArtist(key);
    }

    addArtist = (artist) => {
        const { name, about, imageUrl } = artist;
        const { peopleList } = this.state;
        const newPeopleList = [...peopleList];
        newPeopleList.push({ name, about, imageUrl });
        this.setPeopleList(newPeopleList);
    }

    deleteArtist = (key) => {
        const { peopleList } = this.state;
        const newPeopleList = [...peopleList];
        newPeopleList.splice(key, 1);
        this.setPeopleList(newPeopleList);
    }

    setPeopleList = (peopleList) => {
        const displayList = this.generateDisplayList(peopleList);
        
        localStorage.setItem('peopleList', JSON.stringify(peopleList));
        this.setState({
            peopleList,
            displayList
        });
    }

    onSearchClick = () => {
        this.setPeopleList(this.state.peopleList);
    }

    generateDisplayList = (peopleList) => {
        const searchKeyword = this.ref.querySelector('#search-bar').value;
        if (searchKeyword.trim().length === 0) {
            return peopleList;
        }
        return peopleList.filter(({ name }) => {
            return name.includes(searchKeyword);
        });
    }

    onToggleForm = () => {
        this.setState(({ displayForm }) => ({
            displayForm: !displayForm
        }));
    }

}

Rongyi.render(document.querySelector('#root'), new App());