const Rongyi = (function () {
    const parser = new RongyiParser();

    class Component {

        constructor(props = {}) {
            this.state = {};
            for (const key of Object.keys(props)) {
                const val = props[key];
                const num = Number(val);
                if (!isNaN(num)) {
                    props[key] = num;
                }
            }
            this.props = props;
            this.onSetState = [];
        }

        setState = (stateUpdate) => {
            if (typeof stateUpdate === 'function') {
                stateUpdate = stateUpdate(this.state);
            }
            const prevState = this.state;
            this.state = { ...this.state, ...stateUpdate };
            if (this.__shouldComponentUpdate(prevState, this.state)) {
                this.__notifyStateUpdated();
            }
        }

        componentDidMount() { }

        __shouldComponentUpdate = (prevState, currentState) => {
            return JSON.stringify(prevState) !== JSON.stringify(currentState);
        }

        __watchSetState = (callback) => {
            this.onSetState.push(callback);
        }

        __notifyStateUpdated = () => {
            for (const callback of this.onSetState) {
                callback(this.state);
            }
        }

        __getValue = (key) => {
            if (key.startsWith('state.')) {
                return this.state[key.substring(6)];
            } else if (key.startsWith('props.')) {
                return this.props[key.substring(6)];
            } else if (key.startsWith('methods.')) {
                return this[key.substring(8)];
            } else {
                return key;
            }
        }

    }

    const components = {};

    const register = (name, rongyiElement) => {
        if (components[name] != null) {
            // avoid duplicate registration
            console.warn('The name [' + name + '] has already been registered by another component');
            return;
        }
        components[name] = rongyiElement;
    };

    const toHTMLElement = (htmlStructure, rongyiElement, parent) => {
        const ComponentClass = components[htmlStructure.name];
        if (ComponentClass != null) {
            const props = {};
            for (const { key, value } of htmlStructure.attributes) {
                props[key] = rongyiElement.__getValue(value);
            };
            const component = new ComponentClass(props);
            const container = document.createElement('div');
            let htmlElement;
            const renderOnce = () => {
                if (htmlElement) {
                    htmlElement.remove();
                }
                const htmlElementStructure = parser.parseFromString(component.render());
                htmlElement = toHTMLElement(htmlElementStructure, component, container);
                component.ref = htmlElement;
                container.append(htmlElement);

            };
            component.__watchSetState(renderOnce);
            renderOnce();
            component.componentDidMount();
            return container;
        } else {
            const htmlElement = document.createElement(htmlStructure.name);
            for (const { key, value } of htmlStructure.attributes) {
                if (key.startsWith('ry-on:')) {
                    htmlElement.addEventListener(key.substring(6), rongyiElement.__getValue(value));
                }  else {
                    htmlElement.setAttribute(key, rongyiElement.__getValue(value));
                }
            };
            for (const child of htmlStructure.children) {
                if (typeof child === 'string') {
                    htmlElement.append(child);
                } else if (typeof child === 'object') {
                    const childElement = toHTMLElement(child, rongyiElement, htmlElement);
                    if (childElement) {
                        htmlElement.append(childElement);
                    }
                }
            };
            return htmlElement;
        }
    }

    const render = (rootElement, rongyiElement) => {
        if (rootElement == null) {
            throw new Error('Root HTML Element cannot be null');
        }
        let htmlElement;
        const renderOnce = () => {
            // potential performance issue: maybe do a DOM tree comparison?
            if (htmlElement) {
                htmlElement.remove();
            }
            const htmlElementStructure = parser.parseFromString(rongyiElement.render());
            htmlElement = toHTMLElement(htmlElementStructure, rongyiElement, rootElement);
            rongyiElement.ref = htmlElement;
            rootElement.append(htmlElement);
        };

        renderOnce();
        rongyiElement.__watchSetState(renderOnce);
        rongyiElement.componentDidMount();
    };

    return { Component, render, register };
})();