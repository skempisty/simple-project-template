import React, { Component } from 'react';


class Input extends Component {

    state = {
        action: ""
    };

    async addTodo() {
        const task = {action: this.state.action}

        if (task.action && task.action.length > 0){
            try {
                const postResponse = await fetch('/api/todos', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(task)
                });

                const postBopy = await postResponse.json();
                if(postBopy.data){
                    this.props.getTodos();
                    this.setState({action: ""})
                }
            } catch(error) {
                console.log(error);
            }
        } else {
            console.log('input field required')
        }
    }

    handleChange(e) {
        this.setState({
            action: e.target.value
        })
    }

    render() {
        let { action } = this.state;
        return (
            <div>
                <input type="text" onChange={this.handleChange} value={action} />
                <button onClick={this.addTodo}>add todo</button>
            </div>
        )
    }
}

export default Input
