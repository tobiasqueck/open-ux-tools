import * as React from 'react';
import * as Enzyme from 'enzyme';
import type { UIComboBoxProps, UIComboBoxState } from '../../../src/components/UIComboBox';
import { UIComboBox } from '../../../src/components/UIComboBox';
import { data as originalData, groupsData as originalGroupsData } from '../../__mock__/select-data';
import { initIcons } from '../../../src/components/Icons';
import type { IComboBox, IComboBoxOption } from '@fluentui/react';
import { KeyCodes, ComboBox, Autofill } from '@fluentui/react';

const data = JSON.parse(JSON.stringify(originalData));
const groupsData = JSON.parse(JSON.stringify(originalGroupsData));

describe('<UIComboBox />', () => {
    let wrapper: Enzyme.ReactWrapper<UIComboBoxProps, UIComboBoxState>;
    const menuDropdownSelector = 'div.ts-Callout-Dropdown';
    const nonHighlighttItemSelector = `${menuDropdownSelector} .ms-ComboBox-optionsContainer .ms-Button--command .ms-ComboBox-optionText`;
    const highlightItemSelector = `${menuDropdownSelector} .ms-ComboBox-optionsContainer .ms-Button--command .ts-Menu-option`;
    const inputSelector = 'input.ms-ComboBox-Input';
    const headerItemSelector = '.ms-ComboBox-header';
    initIcons();

    const openDropdown = (): void => {
        wrapper.find('.ms-ComboBox .ms-Button--icon').simulate('click', document.createEvent('Events'));
    };

    const triggerSearch = (query: string) => {
        wrapper.find('input').simulate('input', {
            target: {
                value: query
            }
        });
    };

    beforeEach(() => {
        wrapper = Enzyme.mount(<UIComboBox options={data} highlight={false} allowFreeform={true} autoComplete="on" />);
    });

    afterEach(() => {
        jest.clearAllMocks();
        wrapper.unmount();
    });

    it('Test css selectors which are used in scss - main', () => {
        expect(wrapper.find('.ms-ComboBox').length).toEqual(1);
        expect(wrapper.find('.ms-ComboBox .ms-Button--icon i svg').length).toEqual(1);
        openDropdown();
        expect(wrapper.find(menuDropdownSelector).length).toEqual(1);
        expect(wrapper.find(`${menuDropdownSelector} .ms-Callout-main`).length).toBeGreaterThan(0);
        expect(
            wrapper.find(`${menuDropdownSelector} .ms-ComboBox-optionsContainer .ms-Button--command`).length
        ).toBeGreaterThan(0);
        expect(wrapper.find(nonHighlighttItemSelector).length).toBeGreaterThan(0);
        expect(wrapper.find(highlightItemSelector).length).toEqual(0);
    });

    it('Styles - default', () => {
        const styles = wrapper.find(ComboBox).props().styles;
        expect(styles).toMatchInlineSnapshot(
            {},
            `
            Object {
              "errorMessage": Array [
                Object {
                  "backgroundColor": "var(--vscode-inputValidation-errorBackground)",
                  "borderBottom": "1px solid var(--vscode-inputValidation-errorBorder)",
                  "borderColor": "var(--vscode-inputValidation-errorBorder)",
                  "borderLeft": "1px solid var(--vscode-inputValidation-errorBorder)",
                  "borderRight": "1px solid var(--vscode-inputValidation-errorBorder)",
                  "color": "var(--vscode-input-foreground)",
                  "margin": 0,
                  "paddingBottom": 5,
                  "paddingLeft": 8,
                  "paddingTop": 4,
                },
              ],
              "label": Object {
                "color": "var(--vscode-input-foreground)",
                "fontFamily": "var(--vscode-font-family)",
                "fontSize": "13px",
                "fontWeight": "bold",
                "padding": "4px 0",
              },
            }
        `
        );
    });

    describe('Test highlight', () => {
        beforeEach(() => {
            wrapper.setProps({
                highlight: true
            });
        });

        it('Test css selectors which are used in scss - with highlight', () => {
            openDropdown();
            expect(wrapper.find(highlightItemSelector).length).toBeGreaterThan(0);
            expect(wrapper.find(nonHighlighttItemSelector).length).toEqual(0);
        });

        describe('Test on "Keydown"', () => {
            const openMenuOnClickOptions = [true, false, undefined];
            for (const openMenuOnClick of openMenuOnClickOptions) {
                it(`Test on "Keydown" - open callout, "openMenuOnClick=${openMenuOnClick}"`, () => {
                    wrapper.setProps({
                        openMenuOnClick
                    });
                    expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
                    wrapper.find('input').simulate('keyDown', {});
                    expect(wrapper.find(menuDropdownSelector).length).toEqual(1);
                });
            }

            it('Test on "Keydown" - test arrow Cycling', () => {
                expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
                // Open callout
                wrapper.find('input').simulate('keyDown', { which: KeyCodes.down });
                expect(wrapper.find(menuDropdownSelector).length).toEqual(1);
                // First empty option
                expect(wrapper.find('.ts-ComboBox--selected .ts-Menu-option').text()).toEqual('');
                // Test cycling UP - last item should be selected
                wrapper.find('input').simulate('keyDown', { which: KeyCodes.up });
                expect(wrapper.find('.ts-ComboBox--selected .ts-Menu-option').text()).toEqual('Yemen');
                // Test cycling UP - first item should be selected
                wrapper.find('input').simulate('keyDown', { which: KeyCodes.down });
                expect(wrapper.find('.ts-ComboBox--selected .ts-Menu-option').text()).toEqual('');
                // Go one more step down
                wrapper.find('input').simulate('keyDown', { which: KeyCodes.down });
                expect(wrapper.find('.ts-ComboBox--selected .ts-Menu-option').text()).toEqual('Algeria');
            });

            it(`Test on "Keydown" - keyboard keys, which does not trigger dropdown open`, () => {
                const ignoredOpenKeys = ['Meta', 'Control', 'Shift', 'Tab', 'Alt', 'CapsLock'];

                expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
                for (const ignoredKey of ignoredOpenKeys) {
                    wrapper.find('input').simulate('keyDown', { key: ignoredKey });
                }
                // None of previously pressed keys should not trigger open for dropdown menu
                expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
                // Trigger with valid key
                wrapper.find('input').simulate('keyDown', { key: 'a' });
                expect(wrapper.find(menuDropdownSelector).length).toEqual(1);
            });
        });

        it('Test "onInput"', () => {
            const query = 'Lat';
            wrapper.find('input').simulate('keyDown', {});
            triggerSearch(query);
            expect(wrapper.find('.ts-Menu-option--highlighted').length).toEqual(1);
            expect(wrapper.find('.ts-Menu-option--highlighted').text()).toEqual(query);
        });

        it('Test "reserQuery"', () => {
            openDropdown();
            triggerSearch('Au');
            expect(wrapper.find(menuDropdownSelector).length).toEqual(1);
            let hiddenItemsExist = wrapper.props().options.some((option) => {
                return option.hidden;
            });
            expect(hiddenItemsExist).toEqual(true);
            // Close callout
            wrapper.find('input').simulate('keyDown', { which: KeyCodes.escape });
            expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
            hiddenItemsExist = wrapper.props().options.some((option) => {
                return option.hidden;
            });
            expect(hiddenItemsExist).toEqual(false);
        });

        it('Test list visibility', () => {
            expect(wrapper.state().isListHidden).toBeFalsy();
            wrapper.find('input').simulate('keyDown', {});
            triggerSearch('Lat');
            // List should be visible - there is some occurrences
            expect(wrapper.state().isListHidden).toBeFalsy();
            // List should be hidden - there any occurrence
            triggerSearch('404');
            expect(wrapper.state().isListHidden).toBeTruthy();
        });
    });

    it('Test "useComboBoxAsMenuMinWidth"', () => {
        expect(wrapper.state().minWidth).toEqual(undefined);
        wrapper = Enzyme.mount(
            <UIComboBox
                options={data}
                highlight={false}
                allowFreeform={true}
                autoComplete="on"
                useComboBoxAsMenuMinWidth={true}
            />
        );
        openDropdown();
        // I would like to add more check, but can not access private variables
        expect(wrapper.state().minWidth).toEqual(0);
    });

    it('Test menu close method', () => {
        const comboboxRef = React.createRef<UIComboBox & HTMLDivElement>();
        wrapper = Enzyme.mount(
            <UIComboBox
                ref={comboboxRef}
                options={data}
                highlight={true}
                allowFreeform={true}
                autoComplete="on"
                useComboBoxAsMenuMinWidth={true}
            />
        );
        expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
        // Open callout
        openDropdown();
        expect(wrapper.find(menuDropdownSelector).length).toEqual(1);
        comboboxRef.current?.dismissMenu();
        wrapper.update();
        expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
    });

    describe('Multiselect', () => {
        it('No filtration', () => {
            const comboboxRef = React.createRef<UIComboBox & HTMLDivElement>();
            let keys = [];
            const onChange = jest
                .fn()
                .mockImplementation((event: React.FormEvent<IComboBox>, option?: IComboBoxOption | undefined) => {
                    keys = [...keys, option.key].filter((k) => (option.selected ? true : k !== option.key));
                });

            wrapper = Enzyme.mount(
                <UIComboBox
                    ref={comboboxRef}
                    options={data}
                    highlight={true}
                    allowFreeform={true}
                    multiSelect={true}
                    autoComplete="on"
                    useComboBoxAsMenuMinWidth={true}
                    selectedKey={keys}
                    onChange={onChange}
                />
            );
            expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
            // Open callout
            openDropdown();
            expect(wrapper.find(menuDropdownSelector).length).toEqual(1);
            // select some options
            const options = wrapper.find('.ms-Checkbox.is-enabled.ms-ComboBox-option');
            expect(options.length).toBeGreaterThan(0);
            options
                .at(1)
                .find('input')
                .simulate('change', {
                    target: {
                        value: true,
                        name: 'test1'
                    }
                });
            options
                .at(2)
                .find('input')
                .simulate('change', {
                    target: {
                        checked: true,
                        name: 'test2'
                    }
                });

            wrapper.setProps({ selectedKey: keys });
            wrapper.update();

            expect(onChange).toHaveBeenCalledTimes(2);
            expect(onChange.mock.calls.map((parms) => parms[1].key)).toMatchInlineSnapshot(`
                Array [
                  "DZ",
                  "AR",
                ]
            `);

            const selectedOptions = wrapper.find('.ms-Checkbox.is-checked.ms-ComboBox-option');
            expect(selectedOptions.length).toBe(2);
        });

        it('With filter and changes in options', () => {
            const comboboxRef = React.createRef<UIComboBox & HTMLDivElement>();
            let keys = [];
            const onChange = jest
                .fn()
                .mockImplementation((event: React.FormEvent<IComboBox>, option?: IComboBoxOption | undefined) => {
                    keys = [...keys, option.key].filter((k) => (option.selected ? true : k !== option.key));
                });

            wrapper = Enzyme.mount(
                <UIComboBox
                    ref={comboboxRef}
                    options={data}
                    highlight={true}
                    allowFreeform={true}
                    multiSelect={true}
                    autoComplete="on"
                    useComboBoxAsMenuMinWidth={true}
                    selectedKey={keys}
                    onChange={onChange}
                />
            );

            expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
            const query = 'Lat';
            wrapper.find('input').simulate('keyDown', {});
            wrapper
                .find('input')
                .at(0)
                .simulate('input', {
                    target: {
                        value: query
                    }
                });
            expect(wrapper.find('.ts-Menu-option--highlighted').length).toEqual(1);
            expect(wrapper.find('.ts-Menu-option--highlighted').text()).toEqual(query);

            // select some options
            const options = wrapper.find('.ms-Checkbox.is-enabled.ms-ComboBox-option');
            expect(options.length).toBeGreaterThan(0);
            options
                .at(0)
                .find('input')
                .simulate('change', {
                    target: {
                        value: true,
                        name: 'test1'
                    }
                });

            wrapper.setProps({ selectedKey: keys, options: [...data] });
            wrapper.update();
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange.mock.calls.map((parms) => parms[1].key)).toMatchInlineSnapshot(`
                Array [
                  "LV",
                ]
            `);

            const selectedOptions = wrapper.find('.ms-Checkbox.is-checked.ms-ComboBox-option');
            expect(selectedOptions.length).toBe(1);
        });
    });

    describe('onScrollToItem - multi select combobox', () => {
        const testCases = [
            {
                scrollHeight: 2000,
                clientHeight: 200,
                scrollTop: 50,
                element: {
                    offsetTop: 500,
                    clientHeight: 50
                },
                expect: 350
            },
            {
                scrollHeight: 2000,
                clientHeight: 200,
                scrollTop: 1500,
                element: {
                    offsetTop: 500,
                    clientHeight: 50
                },
                expect: 500
            },
            {
                scrollHeight: 2000,
                clientHeight: 200,
                scrollTop: 0,
                element: {
                    offsetTop: 100,
                    clientHeight: 50
                },
                expect: undefined
            },
            // Single select should not invoke solutin for fix, because there no issue in single select combobox
            {
                singleSelect: true,
                scrollHeight: 2000,
                clientHeight: 200,
                scrollTop: 1500,
                element: {
                    offsetTop: 500,
                    clientHeight: 50
                },
                expect: undefined
            }
        ];
        for (const testCase of testCases) {
            it('Scroll to selection', async () => {
                const parent = document.createElement('div');
                jest.spyOn(parent, 'scrollHeight', 'get').mockReturnValue(testCase.scrollHeight);
                jest.spyOn(parent, 'clientHeight', 'get').mockReturnValue(testCase.clientHeight);
                jest.spyOn(parent, 'scrollTop', 'get').mockReturnValue(testCase.scrollTop);
                const scrollTopSetter = jest.spyOn(parent, 'scrollTop', 'set');
                jest.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(parent);
                wrapper = Enzyme.mount(
                    <UIComboBox
                        options={data}
                        highlight={true}
                        allowFreeform={true}
                        multiSelect={!testCase.singleSelect}
                        autoComplete="on"
                        useComboBoxAsMenuMinWidth={true}
                    />
                );
                const combobox = wrapper.find(ComboBox);
                const onScrollToItem = combobox.prop('onScrollToItem');
                if (testCase.singleSelect) {
                    // Single select should not invoke solutin for fix, because there no issue in single select combobox
                    expect(onScrollToItem).toBeUndefined();
                    return;
                }
                // Open callout
                openDropdown();
                const input = wrapper.find(inputSelector);
                input.simulate('keyDown', { which: KeyCodes.down });
                // Mock element
                const element: HTMLElement = wrapper.find('.ts-ComboBox--selected').getDOMNode();
                jest.spyOn(element, 'offsetTop', 'get').mockReturnValue(testCase.element.offsetTop);
                jest.spyOn(element, 'clientHeight', 'get').mockReturnValue(testCase.element.clientHeight);
                // Simulate navigation
                onScrollToItem(5);
                // Check result
                expect(scrollTopSetter).toBeCalledTimes(testCase.expect ? 1 : 0);
                if (testCase.expect !== undefined) {
                    expect(scrollTopSetter).toBeCalledWith(testCase.expect);
                }
            });
        }
    });

    describe('Error message', () => {
        it('Error', () => {
            wrapper.setProps({
                errorMessage: 'dummy'
            });
            expect(wrapper.find('.ts-ComboBox--error').length).toEqual(1);
            expect(wrapper.find('.ts-ComboBox--warning').length).toEqual(0);
            expect(wrapper.find('.ts-ComboBox--info').length).toEqual(0);
        });

        it('Warning', () => {
            wrapper.setProps({
                warningMessage: 'dummy'
            });
            expect(wrapper.find('.ts-ComboBox--error').length).toEqual(0);
            expect(wrapper.find('.ts-ComboBox--warning').length).toEqual(1);
            expect(wrapper.find('.ts-ComboBox--info').length).toEqual(0);
        });

        it('Info', () => {
            wrapper.setProps({
                infoMessage: 'dummy'
            });
            expect(wrapper.find('.ts-ComboBox--error').length).toEqual(0);
            expect(wrapper.find('.ts-ComboBox--warning').length).toEqual(0);
            expect(wrapper.find('.ts-ComboBox--info').length).toEqual(1);
        });
    });

    describe('Behavior of title/tooltip for options', () => {
        const buttonSelector = `${menuDropdownSelector} .ms-Button--command`;
        it('Default - inherit from text', () => {
            wrapper.setProps({
                highlight: true,
                options: originalData
            });
            openDropdown();
            expect(wrapper.find(buttonSelector).last().getDOMNode().getAttribute('title')).toEqual('Yemen');
        });

        it('Custom title', () => {
            const expectTitle = 'dummy';
            const dataTemp = JSON.parse(JSON.stringify(originalData));
            dataTemp[dataTemp.length - 1].title = expectTitle;
            wrapper.setProps({
                highlight: true,
                options: dataTemp
            });
            openDropdown();
            expect(wrapper.find(buttonSelector).last().getDOMNode().getAttribute('title')).toEqual(expectTitle);
        });

        it('No title', () => {
            const dataTemp = JSON.parse(JSON.stringify(originalData));
            dataTemp[dataTemp.length - 1].title = null;
            wrapper.setProps({
                highlight: true,
                options: dataTemp
            });
            openDropdown();
            expect(wrapper.find(buttonSelector).last().getDOMNode().getAttribute('title')).toEqual(null);
        });
    });

    describe('Test "openMenuOnClick" property', () => {
        const testCases = [
            {
                value: true,
                expectOpen: true
            },
            {
                value: undefined,
                expectOpen: true
            },
            {
                value: false,
                expectOpen: false
            }
        ];
        for (const testCase of testCases) {
            it(`Click on input, "openMenuOnClick=${testCase.value}"`, () => {
                wrapper.setProps({
                    openMenuOnClick: testCase.value
                });
                expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
                wrapper.find('input').simulate('click');
                expect(wrapper.find(menuDropdownSelector).length).toEqual(testCase.expectOpen ? 1 : 0);
            });
        }
    });

    describe('Test "isForceEnabled" property', () => {
        const testCases = [true, false];
        for (const testCase of testCases) {
            it(`isForceEnabled=${testCase}`, () => {
                wrapper.setProps({
                    options: [],
                    isForceEnabled: testCase
                });
                expect(wrapper.find(ComboBox).prop('disabled')).toEqual(!testCase);
            });
        }
    });

    it('Test "disabled" property', () => {
        wrapper.setProps({
            disabled: true
        });
        const inputProps = wrapper.find(inputSelector)?.props();
        expect(inputProps?.disabled).toEqual(undefined);
        expect(inputProps?.readOnly).toEqual(true);
        expect(inputProps?.tabIndex).toEqual(undefined);
        expect(inputProps?.['aria-disabled']).toEqual(true);
    });

    describe('Test "readonly" property', () => {
        const testCases = [
            {
                readOnly: true,
                expected: {
                    readOnly: true,
                    tabIndex: undefined
                }
            },
            {
                readOnly: true,
                tabIndex: 4,
                expected: {
                    readOnly: true,
                    tabIndex: 4
                }
            },
            {
                readOnly: true,
                disabled: true,
                expected: {
                    readOnly: true,
                    tabIndex: undefined
                }
            },
            {
                readOnly: undefined,
                expected: {
                    readOnly: false,
                    tabIndex: undefined
                }
            },
            {
                readOnly: false,
                expected: {
                    readOnly: false,
                    tabIndex: undefined
                }
            }
        ];
        for (const testCase of testCases) {
            it(`"readOnly=${testCase.readOnly}", "tabIndex=${testCase.tabIndex}", "disabled=${testCase.disabled}"`, () => {
                const { expected } = testCase;
                wrapper.setProps({
                    readOnly: testCase.readOnly,
                    ...(testCase.tabIndex && { tabIndex: testCase.tabIndex }),
                    ...(testCase.disabled && { disabled: testCase.disabled })
                });
                const autofill = wrapper.find(Autofill);
                expect(autofill.length).toEqual(1);
                const autofillProps = autofill.props();
                expect(autofillProps.readOnly).toEqual(expected.readOnly);
                expect(autofillProps.tabIndex).toEqual(expected.tabIndex);
                const className = wrapper.find('.ts-ComboBox').prop('className');
                expect(className?.includes('ts-ComboBox--readonly')).toEqual(
                    !testCase.disabled ? !!expected.readOnly : false
                );
                expect(className?.includes('ts-ComboBox--disabled')).toEqual(!!testCase.disabled);
                // Additional properties
                if (!testCase.disabled && expected.readOnly) {
                    expect(autofillProps['aria-readonly']).toEqual(true);
                    expect('aria-disabled' in autofillProps).toEqual(true);
                    expect(autofillProps['aria-disabled']).toEqual(undefined);
                } else {
                    expect('aria-readonly' in autofillProps).toEqual(false);
                    expect(autofillProps['aria-disabled']).toEqual(!!testCase.disabled);
                }
            });
        }
    });

    describe('Empty combobox classname', () => {
        const testCases = [
            {
                text: undefined,
                selectedKey: 'EE',
                expected: false
            },
            {
                text: undefined,
                selectedKey: ['EE'],
                expected: false
            },
            {
                text: 'Dummy',
                selectedKey: undefined,
                expected: false
            },
            {
                text: undefined,
                selectedKey: undefined,
                expected: true
            },
            {
                text: undefined,
                selectedKey: [],
                expected: true
            }
        ];
        for (const testCase of testCases) {
            it(`"text=${testCase.text}", "selectedKey=${
                Array.isArray(testCase.selectedKey) ? JSON.stringify(testCase.selectedKey) : testCase.selectedKey
            }"`, () => {
                wrapper.setProps({
                    text: testCase.text,
                    selectedKey: testCase.selectedKey
                });
                expect(wrapper.find('div.ts-ComboBox--empty').length).toEqual(testCase.expected ? 1 : 0);
            });
        }
    });

    describe('Combobox items with group headers', () => {
        beforeEach(() => {
            wrapper.setProps({
                highlight: true,
                options: groupsData
            });
            wrapper.update();
        });

        it('Test css selectors which are used in scss - with highlight', () => {
            openDropdown();
            expect(wrapper.find(headerItemSelector).length).toEqual(7);
            // Search items and hide group header if no matching children
            wrapper.find('input').simulate('keyDown', {});
            triggerSearch('Est');
            expect(wrapper.find(headerItemSelector).length).toEqual(1);
            expect(wrapper.find(headerItemSelector).text()).toEqual('Europe');
            // Search and match first group
            triggerSearch('gypt');
            expect(wrapper.find(headerItemSelector).length).toEqual(1);
            expect(wrapper.find(headerItemSelector).text()).toEqual('Africa');
            // Search and match last group
            triggerSearch('dumy');
            expect(wrapper.find(headerItemSelector).length).toEqual(1);
            expect(wrapper.find(headerItemSelector).text()).toEqual('Unknown');
            // Search and match multiple groups
            triggerSearch('la');
            expect(wrapper.find(headerItemSelector).length).toEqual(3);
            // Search without matching
            triggerSearch('404');
            expect(wrapper.find(headerItemSelector).length).toEqual(0);
            // Reset search
            triggerSearch('');
            expect(wrapper.find(headerItemSelector).length).toEqual(7);
        });
    });

    it('Handle "onPendingValueChanged"', () => {
        const onPendingValueChanged = jest.fn();
        wrapper.setProps({
            highlight: true,
            onPendingValueChanged
        });
        expect(wrapper.find(menuDropdownSelector).length).toEqual(0);
        // Open callout
        expect(onPendingValueChanged).not.toBeCalled();
        wrapper.find('input').simulate('keyDown', { which: KeyCodes.down });
        expect(onPendingValueChanged).toBeCalled();
        const callArgs = onPendingValueChanged.mock.calls[0];
        expect(callArgs[0].key).toEqual('LV');
        expect(callArgs[1]).toEqual(35);
    });

    describe('Test "calloutCollisionTransformation" property', () => {
        const testCases = [
            {
                multiSelect: true,
                enabled: true,
                expected: true
            },
            {
                multiSelect: false,
                enabled: true,
                expected: false
            },
            {
                multiSelect: true,
                enabled: false,
                expected: false
            }
        ];
        for (const testCase of testCases) {
            const { multiSelect, enabled, expected } = testCase;
            it(`calloutCollisionTransformation=${enabled}, multiSelect=${multiSelect}`, () => {
                wrapper.setProps({
                    multiSelect: testCase.multiSelect,
                    calloutCollisionTransformation: testCase.enabled
                });
                const dropdown = wrapper.find(ComboBox);
                expect(dropdown.length).toEqual(1);
                const calloutProps = dropdown.prop('calloutProps');
                if (expected) {
                    expect(calloutProps?.preventDismissOnEvent).toBeDefined();
                    expect(calloutProps?.layerProps?.onLayerDidMount).toBeDefined();
                    expect(calloutProps?.layerProps?.onLayerWillUnmount).toBeDefined();
                } else {
                    expect(calloutProps?.preventDismissOnEvent).toBeUndefined();
                    expect(calloutProps?.layerProps?.onLayerDidMount).toBeUndefined();
                    expect(calloutProps?.layerProps?.onLayerWillUnmount).toBeUndefined();
                }
            });
        }
    });
});
