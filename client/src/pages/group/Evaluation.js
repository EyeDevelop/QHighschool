import React, { Component } from 'react';

import Paper from '@material-ui/core/Paper';
import { connect } from "react-redux";
import { setCookie } from "../../store/actions"
import Field from '../../components/Field';
import User from '../user/User';
import Button from '@material-ui/core/Button';

const EVALUATION_FORMATS = [{
	label: "vink",
	value: "check",
	options: [{
		label: "Gehaald",
		value: "passed",
	},
	{
		label: "Niet gehaald",
		value: "failed",
	},
	{
		label: "Niet deelgenomen",
		value: "ND",
	}],
},
{
	label: "trapsgewijs",
	value: "stepwise",
	options: [{
		label: "Onvoldoende",
		value: "O",
	},
	{
		label: "Voldoende",
		value: "V",
	},
	{
		label: "Goed",
		value: "G",
	},
	{
		label: "Niet deelgenomen",
		value: "ND",
	}],
}, {
	label: "cijfer",
	value: "decimal",
	options: "decimal",
}];

function getEvaluationColor(ev) {
	if (ev.assesment === "ND" || ev.assesment == null) {
		return "#673ab7";
	}
	switch (ev.type) {
		case "stepwise":
			return "#3f51b5";
		case "check":
			return "#009688";
		case "decimal":
			return "#00bcd4"
		default:
			return "#673ab7";
	}
}

class Evaluation extends Component {

	render() {
		const e = this.props.evaluation;
		let style = {
			underline: false,
			flex: 1,
		};
		let layout = { td: true };
		if (this.props.student) {
			style.type = "headline";
			style.color = "primaryContrast"
			layout.td = false;
			layout.alignment = "right";
		}
		if (e.type === "decimal") {
			return <Field
				style={style}
				validate={{ min: 1, max: 10, type: "decimalGrade", notEmpty: true }}
				layout={layout}
				label="Beoordeling"
				name={e.userId}
				value={e.assesment ? e.assesment : ""}
				editable={this.props.editable}
				onChange={this.props.handleChange}
			/>
		} else {
			return <Field
				style={style}
				name={e.userId}
				label="Beoordeling"
				layout={layout}
				value={e.assesment ? e.assesment : ""}
				options={EVALUATION_FORMATS.filter(f => f.value === e.type)[0].options}
				editable={this.props.editable}
				onChange={this.props.handleChange}
			/>
		}
	}

}


class EvaluationTab2 extends Component {

	constructor(props) {
		super(props);
		this.state = {
		}
	}

	handleEvaluationChange(event) {
		let newEvaluations = this.props.evaluations.map((e) => {
			if (e.userId === event.name) {
				return {
					...e,
					assesment: event.target.value,
				}
			} else {
				return { ...e }
			}
		});
		this.props.handleChange(newEvaluations);
	}


	handleExplanationChange(event) {
		let newEvaluations = this.props.evaluations.map((e) => {
			if (e.userId === event.name) {
				return {
					...e,
					explanation: event.target.value,
				}
			} else {
				return { ...e }
			}
		});
		this.props.handleChange(newEvaluations);

	}

	handleEvaluationTypeChange(event) {
		let newEvaluations = [];
		for (let i = 0; i < this.props.evaluations.length; i++) {
			newEvaluations.push({
				...this.props.evaluations[i],
				type: event.target.value,
			});
		}
		this.props.handleChange(newEvaluations);
	}

	getExplanationField(e, editable) {
		return <Field
			style={{ underline: false, flex: 5 }}
			layout={{ area: true, td: true }}
			label={"Uitleg"}
			name={e.userId}
			value={e.explanation}
			editable={editable}
			onChange={this.handleExplanationChange.bind(this)}
		/>
	}

	render() {
		const style = {
			marginTop: "10px",
			alignItems: "center",
			paddingRight: "15px",
			paddingLeft: "15px",
			display: "flex",
		};
		const evaluations = this.props.evaluations;
		if (evaluations.length === 0) {
			return "Er zijn nog geen beoordelingen beschikbaar";
		}

		const evComps = evaluations
			.map(evaluation => {
				return (
					<Paper style={style} key={evaluation.userId} component="tr">
						<User display="name" userId={evaluation.userId} />
						<Evaluation editable={this.props.editable} evaluation={evaluation} handleChange={this.handleEvaluationChange.bind(this)} />
						{this.getExplanationField(evaluation, this.props.editable)}
					</Paper >
				);
			});

		if (this.props.editable && this.props.secureLogin == null) {
			return <Paper style={{ padding: "20px" }}>
				<Field value="Log opnieuw in om de beoordelingen te bewerken" layout={{ area: true }} />
				<Button color="primary" variant="contained" onClick={() => {
					setCookie("beforeLoginPath", window.location.pathname + window.location.search, 24);
					document.location.href = "/auth/login?secure=true";
				}}>
					Inloggen
				</Button>
			</Paper>
		}

		return (
			<table style={{ width: "100%" }}>
				<tbody>
					<Paper style={{ ...style, backgroundColor: "#e0e0e0" }} component="tr">
						<td>
							<Field
								style={{ type: "headline", margin: "normal" }}
								value={"Beoordelingen"}
							/>
						</td>
						<td style={{ flex: "5" }} />
						<td>
							<Field
								label="Beoordelingsformaat"
								style={{ type: "caption", underline: false, margin: "normal", labelVisible: true }}
								layout={{ alignment: "right" }}
								value={evaluations[0].type}
								options={EVALUATION_FORMATS}
								editable={this.props.editable}
								onChange={this.handleEvaluationTypeChange.bind(this)}
							/>
						</td>
					</Paper >
					{evComps}
				</tbody>
			</table >
		);
	}

}
function mapStateToProps(state, ownProps) {
	return {
		secureLogin: state.secureLogin,
		users: state.users,
	}
}

const EvaluationTab = connect(mapStateToProps, null)(EvaluationTab2)

export { Evaluation, EvaluationTab, getEvaluationColor };