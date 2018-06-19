import React, { Component } from "react";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

class Login extends Component {

    constructor(props) {
        super(props);
        console.log("a");
    }

    render() {
        return (
            <Paper className="Page" elevation={8}>
                <form onSubmit={this.props.onSubmit}>
                    <TextField
                        name="email"
                        id="email"
                        label="Email"
                        margin="normal"
                        fullWidth
                    />
                    <br />
                    <TextField
                        name="password"
                        id="password"
                        label="Password"
                        margin="normal"
                        type="password"
                        fullWidth
                    />
                    <br />
                    <Button type="submit" variant="contained">
                        Login
                    </Button>
                </form>
            </Paper>
        );
    }
}


export default Login;
