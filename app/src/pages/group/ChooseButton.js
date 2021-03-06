import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Clear from "@material-ui/icons/Clear";
import { connect } from "react-redux";
import {
  toggleEnrollment,
  getEnrolLments
} from "../../store/actions";
import Progress from "../../components/Progress";
import EnrollmentPopup from "./EnrollmentPopup";

class ChooseButton extends Component {
  constructor(props) {
    super(props);
    this.props.getEnrolLments();
    this.state = {
      dialogOpen: false
    };
  }

  preventPopupClose = preventClose => {
    this.preventClose = preventClose;
  };

  handlePopup = doEnroll => {
    if (doEnroll) {
      this.props.toggleEnrollment(this.props.group);
    }
    if (!this.preventClose) {
      this.setState({
        dialogOpen: !this.state.dialogOpen
      });
    }
  };

  render() {
    const props = this.props;
    let dialog = this.state.dialogOpen ? (
      <EnrollmentPopup
        group={props.group}
        hasChosen={props.hasChosen}
        handlePopup={this.handlePopup}
        hasChosenDay={props.hasChosenDay}
        chosenDayGroupName={props.chosenDayGroupName}
        preventPopupClose={this.preventPopupClose}
      />
    ) : null;

    if (props.loading) {
      return <Progress size={30} />;
    }

    if (props.hasChosen) {
      return (
        <Button
          color="primary"
          onClick={() => this.handlePopup(false)}
          style={props.style}
        >
          Ingeschreven
          <Clear />
          {dialog}
        </Button>
      );
    }

    if (this.props.canChoose) {
      return (
        <Button
          color="primary"
          variant="contained"
          onClick={() => this.handlePopup(false)}
          style={this.props.style}
        >
          {"Inschrijven" + (this.props.hasChosenDay ? "*" : "")}
          {dialog}
        </Button>
      );
    } else if (props.group.period < this.props.enrollmentPeriod) {
      return (
        <Button disabled color="primary" style={props.style}>
          Inschrijfperiode verlopen
          {dialog}
        </Button>
      );
    } else {
      return (
        <Button disabled color="primary" style={props.style}>
          Coming Soon
          {dialog}
        </Button>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  if (state.users[state.userId].enrollmentIds == null) {
    return {
      loading: true
    };
  }

  let chosenDayGroupName = -1;
  state.users[state.userId].enrollmentIds.forEach(groupId => {
    const group = state.groups[groupId];
    if (
      group.day === ownProps.group.day &&
      group.period === ownProps.group.period
    ) {
      chosenDayGroupName = group.courseName;
    }
  });

  return {
    canChoose: ownProps.group.enrollable,
    hasChosen:
      state.users[state.userId].enrollmentIds.indexOf(ownProps.group.id) !== -1,
    hasChosenDay: chosenDayGroupName !== -1,
    chosenDayGroupName,
    enrollmentPeriod: state.enrollmentPeriod
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleEnrollment: group => dispatch(toggleEnrollment(group)),
    getEnrolLments: () => dispatch(getEnrolLments())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseButton);
