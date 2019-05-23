import React, { Component } from "react";
import { connect } from "react-redux";

import UserRow from "./UserRow";
import UserPage from "./UserPage";
import UserCard from "./UserCard";
import { setSecureLogin } from "../../store/actions"

import { withRouter } from 'react-router-dom';
import Progress from '../../components/Progress'
import Field from "../../components/Field"
import queryString from "query-string";

class User extends Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		let s = queryString.parse(nextProps.location.search);
		if (s.secureLogin != null) {
			nextProps.setSecureLogin(s.secureLogin);
		}
		// if (s.from === "login" && nextProps.user != null && (nextProps.user.year != null || nextProps.role !== "student")) {
		// 	const beforeLoginPath = getCookie("beforeLoginPath");
		// 	nextProps.history.push(beforeLoginPath);
		// }
		return prevState;
	}

	render() {
		if (this.props.user == null ) {
			if (this.props.display === "page") {
				if (this.props.notExists) {
					return (
						<div className="page">
							De opgevraagde gebruiker bestaat niet
						</div>
					);
				} else {
					return (
						<div className="page">
							<Progress />
						</div>
					);
				}
			} else {
				if (this.props.notExists) {
					return null;
				} else {
					return <Progress />;
				}
			}
		}

		switch (this.props.display) {
			case "name":
				return <Field value={this.props.user.displayName} style={{ type: "title" }} layout={{ td: true }} />;
			case "page":
				return (
					<UserPage {...this.props} />
				);
			case "row":
				return (
					<UserRow {...this.props} actions={[{name:"test", onAction:""}]}/>
				);
			case "card":
			default:
				return (
					<UserCard {...this.props} />
				);
		}
	}
}


function mapStateToProps(state, ownProps) {
	let id = ownProps.match.params.userId || ownProps.userId;
	let display = ownProps.display || "page";

	let notExists = false;
	let user = null;

	if (id == null) {
		id = state.userId;
	}

	if (state.users == null || state.users[id] == null) {
		if (id == null || state.hasFetched.indexOf("User.get(" + id + ")") !== -1) {
			notExists = true;
		}
	} else {
		user = state.users[id];
	}

	return {
		role: state.role,
		user,
		notExists,
		display,
		userId: id,
		ownProfile: ("" + id) === ("" + state.userId),
	}
}

function mapDispatchToProps(dispatch) {
	return {
		setSecureLogin: (secureLogin) => dispatch(setSecureLogin(secureLogin)),
	};
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(User));
