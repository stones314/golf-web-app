import React from "react";
import './../App.css';

class StringInput extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    handleChange(e) {
        this.props.onChange(e.target.value);
    }
    handleSubmit(e) {
        this.props.onSubmit(e);
    }
    handleKeyDown(e) {
        if(e.key === "Enter"){
            this.props.onEnterDown(e);
        }
    }
    renderOk(){
        if(!this.props.withOk) return null;
        return (<input type="submit" value="OK" />);
    }

    render() {
        return (
            <div className="">
                <div className="">
                    {this.props.description}
                </div>
                <div style={{ color: "purple" }}>
                    {this.props.errorMsg}
                </div>
                <form onSubmit={this.handleSubmit} className="">
                    <input
                        type={this.props.type}
                        value={this.props.editVal}
                        onChange={this.handleChange}
                        onKeyDown={this.handleKeyDown} 
                        className=""
                    />
                    {this.renderOk()}
                </form>
            </div>
        );
    }
}

export default StringInput;