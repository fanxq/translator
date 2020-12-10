import TranslatorExtension from '../../content_scripts/extension';
export default {
  data() {
    return {
      keyword: '',
      showDropdown: false,
      id: `select-${+new Date}`,
      inputId: `input-${+new Date}`,
      // originalOptions: JSON.parse(JSON.stringify(this.options)),
      optionList: JSON.parse(JSON.stringify(this.options)),
    }
  },
  props:{
    options: {
      type: Array,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  computed: {
    name() {
      return this.options.find(x => x.code === this.value).name;
    }
  },
  watch: {
    keyword(val) {
      if(val) {
        let keyword = val.trim();
        if (keyword) {
          this.optionList = this.optionList.filter(x => x.name.indexOf(keyword) !== -1);
          return;
        }
      }
      this.optionList = JSON.parse(JSON.stringify(this.options));
    }
  },
  methods: {
    onSelected(ev) {
      if (ev && ev.target) {
        if (ev.target.tagName.toLowerCase() === 'li') {
          this.$emit('input', ev.target.dataset.code);
        }
      }
    },
    toggleDropdown(ev) {
      this.showDropdown = !this.showDropdown;
    }
  },
  mounted() {
    let extensionHostElement = TranslatorExtension.getExtensionHostElement();
    let hostElementId = extensionHostElement.getAttribute('id');
    const documentClickHandler = (ev) => {
      console.log('click');
      if (ev && ev.target && ev.target.id !== hostElementId) {
        if (this.showDropdown) {
          this.showDropdown = false;
        }
      }
    };
    const hostElementClickHandler = (ev) => {
      if (ev && ev.target) {
        if (ev.target.id === this.id) {
          this.toggleDropdown();
          return;
        }
        if (ev.target.id === this.inputId) {
          this.showDropdown = true;
          return;
        }
      }
      this.showDropdown && (this.showDropdown = false);
    };
    document.addEventListener('click', documentClickHandler, false);
    extensionHostElement.shadowRoot.addEventListener('click', hostElementClickHandler, false);
    this.$once('hook:beforeDestroy', () => {
      console.log('hook:beforeDestroy');
      document.removeEventListener('click', documentClickHandler, false);
      extensionHostElement.shadowRoot.removeEventListener('click', hostElementClickHandler, false);
    });
  },
  render() {
    return (
      <span class={this.showDropdown ? 'select active' : 'select'} id={this.id}>
        {this.name}
        <section class="dropdown" style={{display: this.showDropdown ? 'block' : 'none'}}>
          <input id={this.inputId} 
            type="text" 
            placeholder="查找语言" 
            vModel={this.keyword}
            style={{display: this.options.length > 5 ? 'inline-block' : 'none'}}/> 
          <ul class="options" onClick={this.onSelected}>
            {
              this.optionList.length ?
                this.optionList.map(item => <li data-code={item.code}>{item.name}</li>)
                : <li>没有查找到！</li>
            }
          </ul>
        </section>
        
      </span>
    )
  },
}