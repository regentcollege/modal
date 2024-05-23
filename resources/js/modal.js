window.LivewireUIModal = () => {
    return {
        show: false,
        showActiveComponent: true,
        activeComponent: false,
        componentHistory: [],
        modalWidth: null,
        listeners: [],
        
        getActiveComponentModalAttribute(key) {
            try {
                if (this.$wire.get('components')[this.activeComponent] !== undefined) {
                    return this.$wire.get('components')[this.activeComponent]['modalAttributes'][key];
                }
            } catch (error) {
                console.error('Error in getActiveComponentModalAttribute:', error);
            }
        },

        closeModalOnEscape(trigger) {
            try {
                if (this.getActiveComponentModalAttribute('closeOnEscape') === false) {
                    return;
                }

                let force = this.getActiveComponentModalAttribute('closeOnEscapeIsForceful') === true;
                this.closeModal(force);
            } catch (error) {
                console.error('Error in closeModalOnEscape:', error);
            }
        },

        closeModalOnClickAway(trigger) {
            try {
                if (this.getActiveComponentModalAttribute('closeOnClickAway') === false) {
                    return;
                }

                this.closeModal(true);
            } catch (error) {
                console.error('Error in closeModalOnClickAway:', error);
            }
        },

        closeModal(force = false, skipPreviousModals = 0, destroySkipped = false) {
            try {
                if(this.show === false) {
                    return;
                }

                if (this.getActiveComponentModalAttribute('dispatchCloseEvent') === true) {
                    const componentName = this.$wire.get('components')[this.activeComponent].name;
                    Livewire.dispatch('modalClosed', {name: componentName});
                }

                if (this.getActiveComponentModalAttribute('destroyOnClose') === true) {
                    Livewire.dispatch('destroyComponent', {id: this.activeComponent});
                }

                if (skipPreviousModals > 0) {
                    for (var i = 0; i < skipPreviousModals; i++) {
                        if (destroySkipped) {
                            const id = this.componentHistory[this.componentHistory.length - 1];
                            Livewire.dispatch('destroyComponent', {id: id});
                        }
                        this.componentHistory.pop();
                    }
                }

                const id = this.componentHistory.pop();

                if (id && !force) {
                    if (id) {
                        this.setActiveModalComponent(id, true);
                    } else {
                        this.setShowPropertyTo(false);
                    }
                } else {
                    this.setShowPropertyTo(false);
                }
            } catch (error) {
                console.error('Error in closeModal:', error);
            }
        },

        setActiveModalComponent(id, skip = false) {
            try {
                this.setShowPropertyTo(true);

                if (this.activeComponent === id) {
                    return;
                }

                if (this.activeComponent !== false && skip === false) {
                    this.componentHistory.push(this.activeComponent);
                }

                let focusableTimeout = 50;

                if (this.activeComponent === false) {
                    this.activeComponent = id
                    this.showActiveComponent = true;
                    this.modalWidth = this.getActiveComponentModalAttribute('maxWidthClass');
                } else {
                    this.showActiveComponent = false;

                    focusableTimeout = 400;

                    setTimeout(() => {
                        this.activeComponent = id;
                        this.showActiveComponent = true;
                        this.modalWidth = this.getActiveComponentModalAttribute('maxWidthClass');
                    }, 300);
                }

                this.$nextTick(() => {
                    let focusable = this.$refs[id]?.querySelector('[autofocus]');
                    if (focusable) {
                        setTimeout(() => {
                            focusable.focus();
                        }, focusableTimeout);
                    }
                });
            } catch (error) {
                console.error('Error in setActiveModalComponent:', error);
            }
        },

        focusables() {
            try {
                let selector = 'a, button, input:not([type=\'hidden\'], textarea, select, details, [tabindex]:not([tabindex=\'-1\'])';

                return [...this.$el.querySelectorAll(selector)]
                    .filter(el => !el.hasAttribute('disabled'));
            } catch (error) {
                console.error('Error in focusables:', error);
            }
        },

        firstFocusable() {
            try {
                return this.focusables()[0];
            } catch (error) {
                console.error('Error in firstFocusable:', error);
            }
        },

        lastFocusable() {
            try {
                return this.focusables().slice(-1)[0];
            } catch (error) {
                console.error('Error in lastFocusable:', error);
            }
        },

        nextFocusable() {
            try {
                return this.focusables()[this.nextFocusableIndex()] || this.firstFocusable();
            } catch (error) {
                console.error('Error in nextFocusable:', error);
            }
        },

        prevFocusable() {
            try {
                return this.focusables()[this.prevFocusableIndex()] || this.lastFocusable();
            } catch (error) {
                console.error('Error in prevFocusable:', error);
            }
        },

        nextFocusableIndex() {
            try {
                return (this.focusables().indexOf(document.activeElement) + 1) % (this.focusables().length + 1);
            } catch (error) {
                console.error('Error in nextFocusableIndex:', error);
            }
        },

        prevFocusableIndex() {
            try {
                return Math.max(0, this.focusables().indexOf(document.activeElement)) - 1;
            } catch (error) {
                console.error('Error in prevFocusableIndex:', error);
            }
        },

        setShowPropertyTo(show) {
            try {
                this.show = show;

                if (show) {
                    document.body.classList.add('overflow-y-hidden');
                } else {
                    document.body.classList.remove('overflow-y-hidden');

                    setTimeout(() => {
                        this.activeComponent = false;
                        this.$wire.resetState();
                    }, 300);
                }
            } catch (error) {
                console.error('Error in setShowPropertyTo:', error);
            }
        },

        init() {
            try {
                this.modalWidth = this.getActiveComponentModalAttribute('maxWidthClass');

                this.listeners.push(
                    Livewire.on('closeModal', (data) => {
                        this.closeModal(data?.force ?? false, data?.skipPreviousModals ?? 0, data?.destroySkipped ?? false);
                    })
                );

                this.listeners.push(
                    Livewire.on('activeModalComponentChanged', ({id}) => {
                        this.setActiveModalComponent(id);
                    })
                );
            } catch (error) {
                console.error('Error in init:', error);
            }
        },

        destroy() {
            try {
                this.listeners.forEach((listener) => {
                    listener();
                });
            } catch (error) {
                console.error('Error in destroy:', error);
            }
        }
    };
}
