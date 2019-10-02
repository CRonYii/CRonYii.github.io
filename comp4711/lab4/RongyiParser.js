const RongyiParser = (function () {
    const State = {
        Normal: 'Normal',
        ChildrenOrClose1: 'ChildrenOrClose1',
        ChildrenOrClose2: 'ChildrenOrClose2',
        Close: 'Close',
        TagName1: 'TagName1',
        TagName2: 'TagName2',
        TagAttrName1: 'TagAttrName1',
        TagAttrName2: 'TagAttrName2',
        TagAttrValue1: 'TagAttrValue1',
        TagAttrValue2: 'TagAttrValue2',
        TextChildren: 'TextChildren',
        ExpectTokens: 'ExpectTokens',
        End: "End"
    };

    const uppercase_letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const lowercase_letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];


    const validCharSet = new Set([
        ...uppercase_letters,
        ...lowercase_letters,
        ...digits,
        "_", "-", ".", ":"
    ]);

    const validStartCharSet = new Set([
        ...uppercase_letters,
        ...lowercase_letters,
        '_'
    ]);

    const whiteSpaceCharSet = new Set([
        ' ', '\n', '\r', '\t'
    ]);

    const isValidChar = (char) => {
        return validCharSet.has(char);
    };

    const isValidStartChar = (char) => {
        return validStartCharSet.has(char);
    };

    const isWhiteSpace = (char) => {
        return whiteSpaceCharSet.has(char);
    }


    class RongyiParser {

        constructor() {
            this.state = State.Normal;
        }

        parseFromString(input) {
            // reset state
            this.state = State.Normal;
            this.result = null;
            this.currentElement = null;
            // parse input
            for (let i = 0; i < input.length; i++) {
                this.next(input[i]);
            }
            if (this.state !== State.End) {
                throw new Error('Unexpected end of input');
            }
            return this.result;
        }

        expect(tokenList, nextState) {
            this.state = State.ExpectTokens;
            this.expectTokens = tokenList;
            this.nextState = nextState;
        }

        next(char) {
            switch (this.state) {
                case State.Normal: return this.handleNormal(char);
                case State.Close: return this.handleClose(char);
                case State.ChildrenOrClose1: return this.handleChildrenOrClose1(char);
                case State.ChildrenOrClose2: return this.handleChildrenOrClose2(char);
                case State.TextChildren: return this.handleTextChildren(char);
                case State.TagName1: return this.handleTagName1(char);
                case State.TagName2: return this.handleTagName2(char);
                case State.TagAttrName1: return this.handleTagAttrName1(char);
                case State.TagAttrName2: return this.handleTagAttrName2(char);
                case State.TagAttrValue1: return this.handleTagAttrValue1(char);
                case State.TagAttrValue2: return this.handleTagAttrValue2(char);
                case State.ExpectTokens: return this.handleExpectTokens(char);
                case State.End: return;
            }
        }

        handleExpectTokens(char) {
            if (char === this.expectTokens[0]) {
                this.expectTokens = this.expectTokens.substring(1);
                if (this.expectTokens.length === 0) {
                    this.state = this.nextState;
                }
                return;
            }
            throw new Error('Unexpected Token: ' + char);
        }

        handleNormal(char) {
            if (char === '<') {
                this.state = State.TagName1;
                if (!this.currentElement) {
                    this.result = {
                        name: '',
                        attributes: [],
                        children: []
                    };
                    this.currentElement = this.result;
                } else {
                    const children = {
                        name: '',
                        attributes: [],
                        parent: this.currentElement,
                        children: []
                    };
                    this.currentElement.children.push(children);
                    this.currentElement = children;
                }
                return;
            }
            if (isWhiteSpace(char)) {
                // nothing happens
                return;
            }
            throw new Error('Unexpected Token: ' + char);
        }

        handleChildrenOrClose1(char) {
            if (char === '<') {
                this.state = State.ChildrenOrClose2;
                return;
            }
            if (!isWhiteSpace(char)) {
                this.state = State.TextChildren;
                this.currentElement.children.push(char);
            }
        }

        handleChildrenOrClose2(char) {
            if (char === '/') {
                this.expect(this.currentElement.name, State.Close);
                return;
            }
            this.handleNormal('<');
            this.next(char);
        }

        handleClose(char) {
            if (char === '>') {
                const { parent } = this.currentElement;
                delete this.currentElement.parent;
                this.currentElement = parent;
                if (this.currentElement) {
                    this.state = State.ChildrenOrClose1;
                } else {
                    this.state = State.End;
                }
                return;
            }
            throw new Error('Unexpected Token: ' + char);
        }

        handleTextChildren(char) {
            if (char === '<') {
                this.trimTextChild();
                this.state = State.ChildrenOrClose2;
                return;
            }
            this.addToTextChild(char);
        }

        handleTagName1(char) {
            if (isValidStartChar(char)) {
                this.currentElement.name += char;
                this.state = State.TagName2;
                return;
            }
            throw new Error('Unexpected Token: ' + char);
        }

        handleTagName2(char) {
            if (isValidChar(char)) {
                this.currentElement.name += char;
                return;
            }
            if (isWhiteSpace(char)) {
                this.state = State.TagAttrName1;
                return;
            }
            if (char === '>') {
                this.state = State.ChildrenOrClose1;
                return;
            }
            if (char === '/') {
                this.state = State.Close;
                return;
            }
            throw new Error('Unexpected Token: ' + char);
        }

        handleTagAttrName1(char) {
            if (isValidStartChar(char)) {
                this.currentElement.attributes.push({
                    key: char,
                    value: ""
                });
                this.state = State.TagAttrName2;
                return;
            }
            if (char === '>') {
                this.state = State.ChildrenOrClose1;
                return;
            }
            if (char === '/') {
                this.state = State.Close;
                return;
            }
            if (isWhiteSpace(char)) {
                // nothing happens
                return;
            }
            throw new Error('Unexpected Token: ' + char);
        }

        handleTagAttrName2(char) {
            if (isValidChar(char)) {
                const attr = this.currentAttribute();
                attr.key += char;
                return;
            }
            if (char === '=') {
                this.state = State.TagAttrValue1;
                return;
            }
            throw new Error('Unexpected Token: ' + char);
        }

        handleTagAttrValue1(char) {
            if (char === '"' || char === "'") {
                this.endQuote = char;
                this.state = State.TagAttrValue2;
                return;
            }
            throw new Error('Unexpected Token: ' + char);
        }

        handleTagAttrValue2(char) {
            if (char === this.endQuote) {
                this.state = State.TagAttrName1;
                return;
            }
            // TODO: handle transferrable character \ and &;
            const attr = this.currentAttribute();
            attr.value += char;
        }

        currentAttribute() {
            return this.currentElement.attributes[this.currentElement.attributes.length - 1];
        }

        trimTextChild() {
            this.currentElement.children[this.currentElement.children.length - 1] = this.currentElement.children[this.currentElement.children.length - 1].trim();
        }

        addToTextChild(char) {
            return this.currentElement.children[this.currentElement.children.length - 1] += char;
        }

    }

    return RongyiParser;
})();