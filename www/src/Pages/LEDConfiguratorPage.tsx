import React, { useState, createContext, useContext, Dispatch, SetStateAction } from 'react';
import { Button, Card, Container, Form, Row, Col, FormLabel, TabContainer, TabContent, TabPane } from 'react-bootstrap';

import Section from '../Components/Section';
import toInteger from 'lodash/toInteger';

import './LEDConfiguratorPage.scss';

const LED_GROUP_TYPES = [
    { label: 'Buttons', value: 1 },
    { label: 'Joystick', value: 2 },
    { label: 'Status LEDs', value: 3 },
    { label: 'Case LED strip', value: 4 },
    { label: 'Case LED matrix', value: 5 },
];

const LED_MODULE_TYPES = [
    { label: 'WS2812B (most common)', value: 0 },
    { label: 'SK6812', value: 1 },
    { label: 'SK6812-E MINI', value: 2 },
    { label: 'SK6805', value: 3 },
];

const LED_COLOR_FORMATS = [
    { label: 'GRB (most common)', value: 0 },
    { label: 'RGB', value: 1 },
    { label: 'GRBW', value: 2 },
    { label: 'RGBW', value: 3 },
];

enum LedConfiguatorSteps {
    WELCOME     = 0,
    HARDWARE    = 1,
    GROUPSELECT = 2,
    GROUPCONFIG = 3,
    CONFIRM     = 4,
    COMPLETE    = 5,
}

const ConfigurationStepTitles = [
    'Start Page',
    'Hardware Configuration',
    'Group Select',
    'Group Configuration',
    'Confirm Configuration',
    'Configuration Complete'
];

// Define and create a context to make state management easier
class LEDConfigurationState {
    brightness: number;
    step: number;
    currentGroupType: number;
}
interface ILEDConfiguratorContext {
    state: LEDConfigurationState;
    setState: Dispatch<SetStateAction<LEDConfigurationState>>;
}
const LEDConfiguratorContext = createContext<ILEDConfiguratorContext>(null!);


/* Page Child Components */

const ConfiguratorHeader = ({ children }) => {
    return (
        <div className='configurator-header'>
        {/* <Card> */}
            {/* <Card.Body> */}
                {/* {title && <Card.Title>{title}</Card.Title>} */}
                {/* <Card.Text> */}
                    {children}
                {/* </Card.Text> */}
            {/* </Card.Body> */}
        {/* </Card> */}
        </div>
    );
};

const ConfiguratorStepList = () => {
    const { state, setState } = useContext(LEDConfiguratorContext);

    const steps = Object.values(LedConfiguatorSteps)
        .filter((value) => typeof value === "string");

    steps.splice(0, 1); // Exclude WELCOME step

    return (
        <div className='configurator-step-list'>
            {steps.map((step, i) =>
                <div
                    key={`configurator-step-list-item-${step}`}
                    className={`configurator-step-list-item ${i < state.step && 'configurator-step__active'}`}
                >
                    <div className='configurator-step-list-item-progress'></div>
                    <div className='configurator-step-list-item-number'>{i + 1}</div>
                    <span className='configurator-step-list-item-label'>{ConfigurationStepTitles[i + 1]}</span>
                </div>
            )}
        </div>
    );
};

const ConfiguratorNote = ({ children }) => {
    return (
        <div className='alert alert-secondary configurator-note' role='alert'>
            {children}
        </div>
    );
};

const ConfiguratorFormRow = ({ children, label }) => {
    return (
        <Row className='configurator-form-row'>
            <Col xs={12} md={8}>
                <FormLabel className='configurator-form-label'>{label}</FormLabel>
            </Col>
            <Col xs={12} md={4}>
                {children}
            </Col>
        </Row>
    );
};

const ConfiguratorButtonRow = ({ label, prevStep, nextStep }) => {
    const { state, setState } = useContext(LEDConfiguratorContext);

    return (
        <Row className='configurator-form-button-row'>
            <Col xs={12} md={8}>
                {prevStep >= 0 && <Button onClick={() => setState({ ...state, step: prevStep })}><strong>&lt; BACK</strong></Button>}
            </Col>
            <Col xs={12} md={4}>
                {nextStep >= 0 && <Button onClick={() => setState({ ...state, step: nextStep })}><strong>{label} &gt;</strong></Button>}
            </Col>
        </Row>
    );
};


/* Page Step Components */

/* STEP 0 - Welcome Message */
const LEDConfigurator_Welcome = () => {
    const { state, setState } = useContext(LEDConfiguratorContext);
    
    if (state.step !== LedConfiguatorSteps.WELCOME)
        return <></>;
    
    return (
        <Container fluid>
            <ConfiguratorHeader>
                <p>
                    The GP2040-CE LED Configurator will walk you step-by-step
                    through setting up the LED chain in your controller.
                </p>
                <p>
                    Please have the technical information for your LEDs ready,
                    as you will need it during hardware configuration.
                </p>
            </ConfiguratorHeader>
            <ConfiguratorButtonRow
                label='BEGIN'
                prevStep={undefined}
                nextStep={LedConfiguatorSteps.HARDWARE}
            />
        </Container>
    );
};

/* STEP 1 - Hardware Configuration */
/* This step should guide the user to easily configure hardware defines */
const LEDConfigurator_HardwareConfig = () => {
    const { state, setState } = useContext(LEDConfiguratorContext);

    if (state.step !== LedConfiguatorSteps.HARDWARE)
        return <></>;
    
    return (
        <Container fluid>
            <ConfiguratorHeader>
                <p>
                    The page will help you configure the hardware settings for your LED chain. If you need information regarding
                    the capabilities of your LEDs, please refer to their datasheet or the vendor manual for details.
                </p>
                <ConfiguratorNote>
                    <strong>LED HARDWARE CONFIGURATION TIPS</strong>
                    <ul className='configurator-note-list'>
                        <li><strong>All LEDs must be connected to a single data line</strong>.</li>
                        <li>The <strong>LED chain</strong> is the sequence of LED modules connected to the LED data line.</li>
                        <li>If you're using NeoPixel modules or clones, the default type and color format should be sufficient.</li>
                        <li>The maximum LED brightness <em>may</em> be limited by the type and number of LEDs in use.</li>
                    </ul>
                </ConfiguratorNote>
            </ConfiguratorHeader>

            <ConfiguratorFormRow label='Which pin is the LED data line connected to?'>
                <Form.Select>
                    <option value="0">PIN0</option>
                </Form.Select>
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='What type of LEDs?'>
                <Form.Select>
                    {LED_MODULE_TYPES.map((t, i) =>
                        <option key={`module-type-option-${i}`} value={t.value}>{t.label}</option>
                    )}
                </Form.Select>
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='What color format do the LEDs use?'>
                <Form.Select>
                    {LED_COLOR_FORMATS.map((f, i) =>
                        <option key={`color-format-option-${i}`} value={f.value}>{f.label}</option>
                    )}
                </Form.Select>
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='How many LEDs are on the chain?'>
                <Form.Control type="number"></Form.Control>
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='What is the maximum requested brightness?'>
                <Form.Control
                    type="number"
                    min={0} max={100}
                    value={state.brightness}
                    onChange={(e) =>
                        setState({ ...state, brightness: toInteger(e.target.value) })
                    }
                />
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='Keep LEDs on when the connected system is goes to sleep?'>
                <Form.Check inline type='radio' id='suspend-on' name='suspend' label='Yes' />
                <Form.Check inline type='radio' id='suspend-off' name='suspend' label='No' />
            </ConfiguratorFormRow>
            
            <ConfiguratorButtonRow
                label='CONFIGURE LED GROUPS'
                prevStep={LedConfiguatorSteps.WELCOME}
                nextStep={LedConfiguatorSteps.GROUPSELECT}
            />
        </Container>
    );
};

/* STEP 2 - Group Select */
/* This step will be repeated for each group a user defines */
const LEDConfigurator_GroupSelect = () => {
    const { state, setState } = useContext(LEDConfiguratorContext);

    if (state.step !== LedConfiguatorSteps.GROUPSELECT)
        return <></>;
    
    return (
        <div>
            <p>Please select the next group of LEDs:</p>
            <Form.Select onChange={(e) => setState({ ...state, step: toInteger(e.target.value) })}>
                <option value="0">— Select a group —</option>
                {LED_GROUP_TYPES.map((groupType, i) =>
                    <option key={`group-select-${i}`} value={groupType.value}>
                        {groupType.label}
                    </option>
                )}
            </Form.Select>
        </div>
    );
};


/* LED Configurator Page Component */

const LEDConfiguratorPage = () => {
    
    const [state, setState] = useState({
        brightness: 50,
        step: 0,
        currentGroupType: 0,
    });
    
    const title = 'LED Configurator — ' + ConfigurationStepTitles[state.step];

    return (
        <Section title={title}>
            <LEDConfiguratorContext.Provider value={{ state, setState }}>
                <ConfiguratorStepList></ConfiguratorStepList>
                <LEDConfigurator_Welcome></LEDConfigurator_Welcome>
                <LEDConfigurator_HardwareConfig></LEDConfigurator_HardwareConfig>
                <LEDConfigurator_GroupSelect></LEDConfigurator_GroupSelect>
            </LEDConfiguratorContext.Provider>
        </Section>
    );
};

export default LEDConfiguratorPage;
