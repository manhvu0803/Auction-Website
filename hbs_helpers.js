export default {
	if_equal(a, b, option) { 
		if (a == b)
			return option.fn(this);
		else    
			return option.inverse(this);
	},

	section(name, options) {
		if (!this._sections) {
			this._sections = {};
		}
		this._sections[name] = options.fn(this);
	}
}