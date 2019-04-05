import React, { Component } from 'react';
import {IconButton, Snackbar, SnackbarContent} from '@material-ui/core/';
import CloseIcon from '@material-ui/icons/Close';
import { connect } from 'react-redux';

import theme from '../lib/MuiTheme'
import { removeNotification } from '../store/actions';

class NotificationBar extends Component {


	removeNotification = (key) => {
		this.props.removeNotification(this.props.notifications[key]);
	}

	render() {
		let notifications = this.props.notifications.map((not,key) => {
			let color;
			switch (not.priority) {
				case "high":
					color = theme.palette.error.main;
					break;
				case "medium":
					color = "#ff8c00";
					break;
				case "light":
				default:
					color = theme.palette.primary.main;
					break;
			}
			return (
				<Snackbar
				key={key}
				anchorOrigin={{
				  vertical: "bottom",
				  horizontal: "right"
				}}
				open={true}
				style = {{marginBottom:key*65 + "px"}}
				TransitionProps={{direction:"left"}}
			  >
			  <SnackbarContent
			  	style={{background:color}}
					message={<span id="message-id">{not.message}</span>}
					action={[
				  <IconButton key="close"
						onClick={() => {this.removeNotification(key)}} >
						<CloseIcon />
				  </IconButton>
				]} />
			  </Snackbar>		
			);
		});
		return (
			<div>
				{notifications}
			</div>
		);
	}
}

function mapStateToProps(state) {
	let notifications = state.notifications.filter((not) => {
		try {
			return not.type === "bar" && new RegExp(not.scope).test(window.location.pathname);
		} catch (err) {
			return true;
		}
	});
	return {
		notifications: notifications,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		removeNotification: (notification) => dispatch(removeNotification(notification)),
	};
}


export default connect(mapStateToProps, mapDispatchToProps)(NotificationBar);