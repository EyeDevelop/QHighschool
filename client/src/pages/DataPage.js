import React, { Component } from "react";
import Page from "./Page";
import Progress from '../components/Progress';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Paper, Typography } from "@material-ui/core";
import Field from '../components/Field';
import queryString from "query-string";
import Toolbar from '@material-ui/core/Toolbar';

class DataPage extends Component {

	constructor(props) {
		super(props);
		this.state = {
			table:"users",
			data: null,
		};
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		let values = queryString.parse(nextProps.location.search);
		return {
			...prevState,
			...{
				table: values.table? values.table :  "evaluations",
			}
		}
	}

	handleFilterChange = event => {
		this.props.history.push({
			search: "table=" + event.target.value,
		});
	};

	render() {
		//<TEMP>
		const dropDownOption = "user_data"; // or "evaluations", or "enrollments"
		//</TEMP>

		//use this function to fetch the data
		//this function crashes the site 
		//this.props.fetchData(dropDownOption).then(data => this.setState({ data: data }));
		
		return (
			<Page>
				<Paper elevation = {2} style= {{position: "relative"}}> 
					<Toolbar style={{ display: "flex"}}>
						<Typography variant = "subheading" color="textSecondary" style = {{flex: 2}}>
							Gegevens
						</Typography>
						<Field
							label="Tabel"
							value={this.state.table}
							editable
							options={[
								{ label: "Beoordelingen", value: "evaluations" },
								{ label: "Gebruikers", value: "users" },
								{ label: "Inschrijvingen", value: "enrollments" }]}
							onChange={this.handleFilterChange}
						/>
					</Toolbar>
				</Paper>
					<Progress />
			</Page>
		);
	}
}


function mapStateToProps(state) {
	return {
	};
}

function mapDispatchToProps(dispatch) {
	return {
		fetchData: async (table) => {
			//feel free to create some better test-data, (to test responsiveness, and, potentialy 12+ columns!)
			switch (table) {
				case "user_data":
					return [
						["displayName", "firstName", "lastName", "role"],
						["B, Steven", "Steven", "B", "admin"],
						["Doe, Jon", "Jon", "Doe", "student"]
						["B, Steven", "Steven", "B", "admin"],
						["Doe, Jon", "Jon", "Doe", "student"]
						["B, Steven", "Steven", "B", "admin"],
						["Doe, Jon", "Jon", "Doe", "student"]
						["B, Steven", "Steven", "B", "admin"],
						["Doe, Jon", "Jon", "Doe", "student"]
					];
				case "evaluation":
				case "enrollments":
				default:
					return [
						["displayName", "type", "course"],
						["B, Steven", "decimal", "9"],
						["T, Est", "decimal", "6"]
						["B, Steven", "decimal", "9"],
						["T, Est", "decimal", "6"]
						["B, Steven", "decimal", "9"],
						["T, Est", "decimal", "6"]
						["B, Steven", "decimal", "9"],
						["T, Est", "decimal", "6"]
						["B, Steven", "decimal", "9"],
						["T, Est", "decimal", "6"]
					];
			}
		},
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(DataPage);



