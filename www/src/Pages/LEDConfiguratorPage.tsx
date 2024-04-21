import React, { useState, createContext, useContext, Dispatch, SetStateAction } from 'react';
import { Button, Card, Container, Form, Row, Col, FormLabel, ProgressBar, TabContainer, TabContent, TabPane } from 'react-bootstrap';

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

const LedConfiguratorStepCount = LedConfiguatorSteps.COMPLETE;

const ConfigurationStepTitles = [
    'Start Page',
    'Hardware Configuration',
    'Group Configuration',
    'Effect Configuration',
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
        .filter(value => typeof value === "number")
        .map(value => toInteger(value));

    const progress = ((state.step - 1) / (LedConfiguratorStepCount - 1)) * 100;

    return (
        <div className='configurator-step-list'>
            <ProgressBar
                now={progress}
                variant='success'
                className='configurator-step-list-progressbar'
            />
            {steps.filter((s) => s > 0).map((step) =>
                <div
                    key={`configurator-step-list-item-${step}`}
                    className={`configurator-step-list-item ${step <= state.step && 'configurator-step__active'} ${step === state.step && 'configurator-step__current'}`}
                    onClick={() => step < state.step && setState({ ...state, step })}
                >
                    <div className='configurator-step-list-item-number'>{step}</div>
                    <span className='configurator-step-list-item-label'>{ConfigurationStepTitles[step]}</span>
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
            <Col xs={12} md={'auto'} className='col-auto me-auto'>
                {prevStep >= 0 && <Button onClick={() => setState({ ...state, step: prevStep })}><strong>◀ BACK</strong></Button>}
            </Col>
            <Col xs={12} md={'auto'}>
                {nextStep >= 0 && <Button onClick={() => setState({ ...state, step: nextStep })}><strong>{label} ▶</strong></Button>}
            </Col>
        </Row>
    );
};


/* Page Step Components */

/* STEP 0 - Welcome Message */
const LEDConfigurator_StartStep = () => {
    const { state, setState } = useContext(LEDConfiguratorContext);
    
    if (state.step !== LedConfiguatorSteps.WELCOME)
        return <></>;
    
    return (
        <Container fluid>
            <ConfiguratorHeader>
                <p>
                    The LED Configurator will walk you step-by-step
                    through setting up the RGB LEDs in your controller.
                </p>
                <p>
                    If you do not know the technical details of your LEDs,
                    please have the documentation (manual, datasheet, etc.)
                    ready as you will need it for this process.
                </p>
            </ConfiguratorHeader>
            <ConfiguratorButtonRow
                label='CONFIGURE RGB LED HARDWARE'
                prevStep={undefined}
                nextStep={LedConfiguatorSteps.HARDWARE}
            />
        </Container>
    );
};

/* STEP 1 - Hardware Configuration */
/* This step should guide the user to easily configure hardware defines */
const LEDConfigurator_HardwareConfigStep = () => {
    const { state, setState } = useContext(LEDConfiguratorContext);
    const [showAdvanced, setShowAdvanced] = useState(0);

    if (state.step !== LedConfiguatorSteps.HARDWARE)
        return <></>;
    
    return (
        <Container fluid>
            <ConfiguratorHeader>
                <ConfiguratorNote>
                    <strong>RGB LED HARDWARE CONFIGURATION TIPS</strong>
                    <ul className='configurator-note-list'>
                        <li><strong>RGB LEDs connect, in series (daisy-chained), to a single data line</strong>. This is referred to as your <strong>LED Chain</strong>.</li>
                        <li><strong>The maximum LED brightness <em>may</em> be limited</strong> by the type and number of LEDs in use.</li>
                        <li>If you're using NeoPixel modules or clones, the default type and color format should be sufficient.</li>
                        <li>Use LED strips and modules of the same type, and preferrably from the same manufacturer, to ensure proper compatibility.</li>
                    </ul>
                </ConfiguratorNote>
            </ConfiguratorHeader>

            <ConfiguratorFormRow label='Which pin is the RGB LED data line connected to?'>
                <Form.Select>
                    <option value="0">PIN0</option>
                </Form.Select>
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='What type are the RGB LEDs?'>
                <Form.Select>
                    {LED_MODULE_TYPES.map((t, i) =>
                        <option key={`module-type-option-${i}`} value={t.value}>{t.label}</option>
                    )}
                </Form.Select>
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='What color format do the RGB LEDs use?'>
                <Form.Select>
                    {LED_COLOR_FORMATS.map((f, i) =>
                        <option key={`color-format-option-${i}`} value={f.value}>{f.label}</option>
                    )}
                </Form.Select>
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='How many RGB LEDs are on the chain?'>
                <Form.Control type="number"></Form.Control>
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='What is the maximum brightness percentage?'>
                <Form.Control
                    type="number"
                    min={0} max={100}
                    value={state.brightness}
                    onChange={(e) =>
                        setState({ ...state, brightness: toInteger(e.target.value) })
                    }
                />
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='Keep RGB LEDs on when the connected system is goes to sleep?'>
                <Form.Check inline type='radio' id='suspend-on' name='suspend' label='Yes' />
                <Form.Check inline type='radio' id='suspend-off' name='suspend' label='No' />
            </ConfiguratorFormRow>
            <ConfiguratorFormRow label='Show Advanced Settings?'>
                <Form.Check inline id="show-advanced" name="show-advanced" value={showAdvanced} onChange={() => setShowAdvanced(showAdvanced === 1 ? 0 : 1)} />
            </ConfiguratorFormRow>
            
            {showAdvanced === 1 &&
                <>
                    <ConfiguratorFormRow label='Maximum Current Draw (mA)'>
                        <Form.Control type="number"></Form.Control>
                    </ConfiguratorFormRow>
                    <ConfiguratorFormRow label='Data Clock Rate (KHz)'>
                        <Form.Control type="number"></Form.Control>
                    </ConfiguratorFormRow>
                </>
            }
            
            <ConfiguratorButtonRow
                label='CONFIGURE RGB LED GROUPS'
                prevStep={LedConfiguatorSteps.WELCOME}
                nextStep={LedConfiguatorSteps.GROUPSELECT}
            />
        </Container>
    );
};

/* STEP 2 - Group Select */
/* This step will be repeated for each group a user defines */
const LEDConfigurator_GroupConfigStep = () => {
    const { state, setState } = useContext(LEDConfiguratorContext);

    if (state.step !== LedConfiguatorSteps.GROUPSELECT)
        return <></>;
    
    return (
        <Container fluid>
            <ConfiguratorHeader>
                <p>
                    LEDs are grouped by their behavior on the controller.
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
            <Form.Select onChange={(e) => setState({ ...state, step: toInteger(e.target.value) })}>
                <option value="0">— Select a group —</option>
                {LED_GROUP_TYPES.map((groupType, i) =>
                    <option key={`group-select-${i}`} value={groupType.value}>
                        {groupType.label}
                    </option>
                )}
            </Form.Select>
        </Container>
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
                {state.step > 0 && <ConfiguratorStepList></ConfiguratorStepList>}
                <LEDConfigurator_StartStep></LEDConfigurator_StartStep>
                <LEDConfigurator_HardwareConfigStep></LEDConfigurator_HardwareConfigStep>
                <LEDConfigurator_GroupConfigStep></LEDConfigurator_GroupConfigStep>
            </LEDConfiguratorContext.Provider>
        </Section>
    );
};

export default LEDConfiguratorPage;
